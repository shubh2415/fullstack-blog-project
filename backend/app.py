from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import os
from datetime import datetime
import cloudinary
import cloudinary.uploader
import cloudinary.api

# --- App Initialization and Config ---
app = Flask(__name__)

# --- CORS CONFIGURATION ---
CORS(app,
    resources={r"/api/*": {
        "origins": [
            "http://localhost:5173",
            "https://mobicloud-blog.shubhamtel.me",
            "https://fullstack-blog-project-shubh2415.vercel.app" 
        ],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }}
)

# --- Cloudinary Configuration ---
cloudinary.config(
  cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME'),
  api_key = os.environ.get('CLOUDINARY_API_KEY'),
  api_secret = os.environ.get('CLOUDINARY_API_SECRET')
)

basedir = os.path.abspath(os.path.dirname(__file__))
instance_path = os.path.join(basedir, 'instance')
if not os.path.exists(instance_path): os.makedirs(instance_path)

app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL:
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL.replace("postgres://", "postgresql://", 1)
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(instance_path, 'users.db')

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- Database Models (Updated for Cloudinary) ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    user_type = db.Column(db.String(50), nullable=False)
    profile_image_url = db.Column(db.String(300), nullable=True)
    profile_image_public_id = db.Column(db.String(200), nullable=True)
    blogs = db.relationship('Blog', backref='author', lazy=True)
    comments = db.relationship('Comment', backref='commenter', lazy=True)
    pending_blogs = db.relationship('PendingBlog', backref='author', lazy=True)

class Blog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(300), nullable=False)
    image_public_id = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50), nullable=False, default='General')
    pub_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    comments = db.relationship('Comment', backref='post', lazy=True, cascade="all, delete-orphan")

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    pub_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    blog_id = db.Column(db.Integer, db.ForeignKey('blog.id'), nullable=False)

class PendingBlog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_public_id = db.Column(db.String(200), nullable=False)
    image_url = db.Column(db.String(300), nullable=False)
    category = db.Column(db.String(50), nullable=False, default='General')
    status = db.Column(db.String(50), nullable=False, default='pending')
    rejection_reason = db.Column(db.Text, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    submitted_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

# --- Helper Function ---
def _delete_from_cloudinary(public_id):
    if not public_id: return
    try:
        cloudinary.uploader.destroy(public_id)
        print(f"Successfully deleted from Cloudinary: {public_id}")
    except Exception as e:
        print(f"Error deleting from Cloudinary {public_id}: {e}")

# --- API ENDPOINTS ---
@app.route('/')
def index():
    return jsonify({"status": "Backend server is running!"})

# ... (all other routes from your original app.py) ...
# I will only show the changed routes for brevity

@app.route('/api/user/profile-image', methods=['POST'])
def upload_profile_image():
    user_id = request.form.get('userId')
    file = request.files.get('profileImage')
    if not all([user_id, file]):
        return jsonify({"message": "User ID and image file are required."}), 400
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404
    
    if user.profile_image_public_id:
        _delete_from_cloudinary(user.profile_image_public_id)
        
    upload_result = cloudinary.uploader.upload(file, folder="blog_profiles")
    user.profile_image_url = upload_result['secure_url']
    user.profile_image_public_id = upload_result['public_id']
    
    db.session.commit()
    return jsonify({
        "message": "Profile image updated successfully.",
        "profile_image_url": user.profile_image_url
    }), 200

@app.route('/api/blogs/submit', methods=['POST'])
def submit_blog():
    file = request.files.get('image')
    title = request.form.get('title')
    content = request.form.get('content')
    user_id = request.form.get('userId')
    category = request.form.get('category', 'General')
    
    if not all([file, title, content, user_id]):
        return jsonify({"message": "All fields including an image are required."}), 400
    
    upload_result = cloudinary.uploader.upload(file, folder="blog_images")
    
    new_pending_blog = PendingBlog(
        title=title, 
        content=content, 
        image_public_id=upload_result['public_id'], 
        image_url=upload_result['secure_url'],
        user_id=user_id, 
        category=category
    )
    db.session.add(new_pending_blog)
    db.session.commit()
    return jsonify({"message": "Blog submitted successfully for review."}), 201

# Add all your other routes (login, signup, admin, etc.) back here exactly as they were.
# The following is just a placeholder to show where they go.

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name, email, password, confirm_password, user_type = data.get('name'), data.get('email'), data.get('password'), data.get('confirmPassword'), data.get('userType')
    
    if not all([name, email, password, confirm_password, user_type]):
        return jsonify({"message": "All fields are required."}), 400
    if password != confirm_password:
        return jsonify({"message": "Passwords do not match."}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "This email is already registered."}), 409
    
    new_user = User(
        name=name,
        email=email,
        password_hash=generate_password_hash(password),
        user_type=user_type
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Account created successfully!"}), 201

@app.route('/api/login', methods=['POST'])
def unified_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    login_type = data.get('loginType')

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"message": "Invalid email or password."}), 401

    expected_user_type = {
        'user': 'Normal User',
        'guest': 'Guest Author',
        'admin': 'Admin'
    }.get(login_type)

    if not expected_user_type or user.user_type != expected_user_type:
        return jsonify({"message": "Access denied for this role."}), 403
    
    user_data = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "user_type": user.user_type,
        "profile_image_url": user.profile_image_url
    }
    return jsonify({"message": "Login successful!", "user": user_data}), 200


# And so on for all your other routes...


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
