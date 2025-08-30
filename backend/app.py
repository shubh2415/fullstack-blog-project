from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
from datetime import datetime

# --- App Initialization and Config ---
app = Flask(__name__)

# ==================== CORS CONFIGURATION UPDATE ====================
# यहाँ हमने आपके लाइव फ्रंटएंड URL's को जोड़ा है
CORS(app,
    resources={r"/api/*": {
        "origins": [
            "http://localhost:5173", # आपके लोकल डेवलपमेंट के लिए
            "https://mobicloud-blog.shubhamtel.me", # आपका कस्टम डोमेन
            "https://fullstack-blog-project-shubham-telis-projects.vercel.app" # आपका Vercel डोमेन
        ],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }}
)
# =================================================================

# लाइव सर्वर पर इमेज URL बनाने के लिए अपने बैकएंड का URL सेट करें
# आप इसे Render के एनवायरनमेंट वेरिएबल्स में सेट कर सकते हैं
BACKEND_BASE_URL = os.environ.get('BACKEND_BASE_URL', "http://localhost:5000")

basedir = os.path.abspath(os.path.dirname(__file__))
instance_path = os.path.join(basedir, 'instance')
if not os.path.exists(instance_path): os.makedirs(instance_path)

# --- Upload Folders ---
UPLOAD_FOLDER_BLOGS = os.path.join(basedir, 'static/uploads/blogs')
UPLOAD_FOLDER_PROFILES = os.path.join(basedir, 'static/uploads/profiles')
if not os.path.exists(UPLOAD_FOLDER_BLOGS): os.makedirs(UPLOAD_FOLDER_BLOGS)
if not os.path.exists(UPLOAD_FOLDER_PROFILES): os.makedirs(UPLOAD_FOLDER_PROFILES)

app.config['UPLOAD_FOLDER_BLOGS'] = UPLOAD_FOLDER_BLOGS
app.config['UPLOAD_FOLDER_PROFILES'] = UPLOAD_FOLDER_PROFILES
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL:
    # यह कोड सिर्फ Render (Production Server) पर चलेगा
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL.replace("postgres://", "postgresql://", 1)
else:
    # यह कोड आपके लोकल कंप्यूटर (Development) पर चलेगा
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(instance_path, 'users.db')

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- Database Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    user_type = db.Column(db.String(50), nullable=False)
    profile_image_url = db.Column(db.String(300), nullable=True, default='/static/uploads/profiles/default.png')
    blogs = db.relationship('Blog', backref='author', lazy=True)
    comments = db.relationship('Comment', backref='commenter', lazy=True)
    pending_blogs = db.relationship('PendingBlog', backref='author', lazy=True)

class Blog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(300), nullable=False)
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
    image_filename = db.Column(db.String(300), nullable=False)
    category = db.Column(db.String(50), nullable=False, default='General')
    status = db.Column(db.String(50), nullable=False, default='pending')
    rejection_reason = db.Column(db.Text, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    submitted_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

# --- Helper Functions ---
def _delete_file(folder, filename):
    """Helper to safely delete a file."""
    if not filename: return
    try:
        file_path = os.path.join(folder, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Successfully deleted file: {file_path}")
    except Exception as e:
        print(f"Error deleting file {filename}: {e}")

# --- API ENDPOINTS ---

@app.route('/')
def index():
    return jsonify({"status": "Backend server is running!"})

# --- User & Profile Endpoints ---
@app.route('/api/user/profile-image', methods=['POST'])
def upload_profile_image():
    user_id = request.form.get('userId')
    file = request.files.get('profileImage')
    if not all([user_id, file]):
        return jsonify({"message": "User ID and image file are required."}), 400
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404
    
    if user.profile_image_url and 'default.png' not in user.profile_image_url:
        old_filename = os.path.basename(user.profile_image_url)
        _delete_file(app.config['UPLOAD_FOLDER_PROFILES'], old_filename)
        
    unique_filename = str(datetime.now().timestamp()).replace(".", "") + "_" + secure_filename(file.filename)
    file.save(os.path.join(app.config['UPLOAD_FOLDER_PROFILES'], unique_filename))
    
    user.profile_image_url = f"/static/uploads/profiles/{unique_filename}"
    db.session.commit()
    return jsonify({
        "message": "Profile image updated successfully.",
        "profile_image_url": f"{BACKEND_BASE_URL}{user.profile_image_url}"
    }), 200

# --- Guest Author Endpoints ---
@app.route('/api/author/my-posts/<int:author_id>', methods=['GET'])
def get_my_posts(author_id):
    posts = PendingBlog.query.filter_by(user_id=author_id).order_by(PendingBlog.submitted_date.desc()).all()
    output = [{
        'id': post.id,
        'title': post.title,
        'status': post.status,
        'rejection_reason': post.rejection_reason,
        'submitted_date': post.submitted_date.strftime('%d %B %Y')
    } for post in posts]
    return jsonify({'my_posts': output})

@app.route('/api/author/my-posts/<int:post_id>', methods=['DELETE'])
def delete_author_post(post_id):
    post_to_delete = PendingBlog.query.get_or_404(post_id)
    user_id_from_request = request.get_json().get('userId')

    if post_to_delete.user_id != user_id_from_request:
        return jsonify({"message": "You are not authorized to delete this post."}), 403

    _delete_file(app.config['UPLOAD_FOLDER_BLOGS'], post_to_delete.image_filename)
    
    db.session.delete(post_to_delete)
    db.session.commit()
    return jsonify({"message": "Your submission has been successfully deleted."}), 200

# --- Blog Submission & Management Endpoints ---
@app.route('/api/blogs/submit', methods=['POST'])
def submit_blog():
    file, title, content, user_id, category = request.files.get('image'), request.form.get('title'), request.form.get('content'), request.form.get('userId'), request.form.get('category', 'General')
    if not all([file, title, content, user_id]):
        return jsonify({"message": "All fields including an image are required."}), 400
    
    unique_filename = str(datetime.now().timestamp()).replace(".", "") + "_" + secure_filename(file.filename)
    file.save(os.path.join(app.config['UPLOAD_FOLDER_BLOGS'], unique_filename))
    
    new_pending_blog = PendingBlog(title=title, content=content, image_filename=unique_filename, user_id=user_id, category=category)
    db.session.add(new_pending_blog)
    db.session.commit()
    return jsonify({"message": "Blog submitted successfully for review."}), 201

# --- Admin Endpoints ---
@app.route('/api/admin/blogs/create', methods=['POST'])
def admin_create_blog():
    file, title, content, user_id, category = request.files.get('image'), request.form.get('title'), request.form.get('content'), request.form.get('userId'), request.form.get('category', 'General')
    if not all([file, title, content, user_id]):
        return jsonify({"message": "All fields including an image are required."}), 400
    
    user = User.query.get(user_id)
    if not user or user.user_type != 'Admin':
        return jsonify({"message": "Only admins can create blogs directly."}), 403
    
    unique_filename = str(datetime.now().timestamp()).replace(".", "") + "_" + secure_filename(file.filename)
    file.save(os.path.join(app.config['UPLOAD_FOLDER_BLOGS'], unique_filename))
    
    new_blog = Blog(title=title, content=content, image_url=f"/static/uploads/blogs/{unique_filename}", user_id=user_id, category=category)
    db.session.add(new_blog)
    db.session.commit()
    return jsonify({"message": "Blog created and published successfully."}), 201

@app.route('/api/admin/pending-blogs', methods=['GET'])
def get_pending_blogs():
    pending_list = PendingBlog.query.filter_by(status='pending').order_by(PendingBlog.submitted_date.asc()).all()
    return jsonify({'pending_blogs': [{'id': p.id, 'title': p.title, 'author_name': p.author.name, 'submitted_date': p.submitted_date.strftime('%d %B %Y')} for p in pending_list]})

@app.route('/api/admin/pending-blogs/<int:pending_id>', methods=['GET'])
def get_single_pending_blog(pending_id):
    pending_blog = PendingBlog.query.get_or_404(pending_id)
    return jsonify({
        'id': pending_blog.id,
        'title': pending_blog.title,
        'content': pending_blog.content,
        'image_url': f"{BACKEND_BASE_URL}/static/uploads/blogs/{pending_blog.image_filename}",
        'category': pending_blog.category,
        'author_name': pending_blog.author.name,
        'author_image_url': f"{BACKEND_BASE_URL}{pending_blog.author.profile_image_url}",
        'submitted_date': pending_blog.submitted_date.strftime('%d %B %Y')
    })

@app.route('/api/admin/blogs/approve/<int:pending_id>', methods=['POST'])
def approve_blog(pending_id):
    pending_blog = PendingBlog.query.get_or_404(pending_id)
    new_blog = Blog(
        title=pending_blog.title, 
        content=pending_blog.content, 
        image_url=f"/static/uploads/blogs/{pending_blog.image_filename}", 
        user_id=pending_blog.user_id, 
        category=pending_blog.category
    )
    db.session.add(new_blog)
    pending_blog.status = 'approved'
    db.session.commit()
    return jsonify({"message": "Blog has been approved and published."}), 200

@app.route('/api/admin/blogs/reject/<int:pending_id>', methods=['POST'])
def reject_blog(pending_id):
    pending_blog = PendingBlog.query.get_or_404(pending_id)
    reason = request.get_json().get('reason')
    if not reason:
        return jsonify({"message": "Rejection reason is required."}), 400
    
    _delete_file(app.config['UPLOAD_FOLDER_BLOGS'], pending_blog.image_filename)
    
    db.session.delete(pending_blog)
    db.session.commit()

    return jsonify({"message": "Blog has been rejected and the submission removed."}), 200

# --- Public Blog & Comment Endpoints ---
@app.route('/api/blogs', methods=['GET'])
def get_blogs():
    search_term = request.args.get('q', '')
    category = request.args.get('category', '')
    query = Blog.query
    if search_term:
        query = query.filter(Blog.title.ilike(f'%{search_term}%'))
    if category and category.lower() != 'all':
        query = query.filter_by(category=category)
    blogs = query.order_by(Blog.pub_date.desc()).all()
    return jsonify({'blogs': [{'id': blog.id, 'title': blog.title, 'content_snippet': blog.content[:100] + '...','image_url': f"{BACKEND_BASE_URL}{blog.image_url}",'pub_date': blog.pub_date.strftime('%d %B %Y'), 'author_name': blog.author.name, 'category': blog.category} for blog in blogs]})

@app.route('/api/blogs/<int:blog_id>', methods=['GET'])
def get_single_blog(blog_id):
    blog = Blog.query.get_or_404(blog_id)
    comments_output = sorted(
        [{
            'id': c.id, 'content': c.content, 'pub_date': c.pub_date.strftime('%d %B %Y'), 
            'commenter_name': c.commenter.name, 'commenter_id': c.commenter.id, 
            'commenter_image_url': f"{BACKEND_BASE_URL}{c.commenter.profile_image_url}"
        } for c in blog.comments],
        key=lambda c: c['pub_date'], reverse=True
    )
    return jsonify({
        'id': blog.id, 'title': blog.title, 'content': blog.content, 
        'image_url': f"{BACKEND_BASE_URL}{blog.image_url}", 'category': blog.category,
        'pub_date': blog.pub_date.strftime('%d %B %Y'), 'author_name': blog.author.name, 
        'author_image_url': f"{BACKEND_BASE_URL}{blog.author.profile_image_url}",
        'comments': comments_output
    })

@app.route('/api/blogs/<int:blog_id>', methods=['PUT'])
def update_blog(blog_id):
    user_id = request.form.get('adminUserId')
    user = User.query.get(user_id)
    if not user or user.user_type != 'Admin':
        return jsonify({"message": "You are not authorized to perform this action."}), 403

    blog = Blog.query.get_or_404(blog_id)
    blog.title = request.form.get('title', blog.title)
    blog.content = request.form.get('content', blog.content)
    blog.category = request.form.get('category', blog.category)
    
    if 'image' in request.files and request.files['image'].filename != '':
        old_filename = os.path.basename(blog.image_url)
        _delete_file(app.config['UPLOAD_FOLDER_BLOGS'], old_filename)
        
        file = request.files['image']
        unique_filename = str(datetime.now().timestamp()).replace(".", "") + "_" + secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER_BLOGS'], unique_filename))
        blog.image_url = f"/static/uploads/blogs/{unique_filename}"
        
    db.session.commit()
    return jsonify({"message": "Blog updated successfully."}), 200

@app.route('/api/blogs/<int:blog_id>', methods=['DELETE'])
def delete_blog(blog_id):
    user_id = request.get_json().get('adminUserId')
    user = User.query.get(user_id)
    if not user or user.user_type != 'Admin':
        return jsonify({"message": "You are not authorized to perform this action."}), 403

    blog = Blog.query.get_or_404(blog_id)
    
    if blog.image_url:
        filename = os.path.basename(blog.image_url)
        _delete_file(app.config['UPLOAD_FOLDER_BLOGS'], filename)
            
    db.session.delete(blog)
    db.session.commit()
    return jsonify({'message': 'Blog deleted successfully'}), 200

@app.route('/api/blogs/<int:blog_id>/comments', methods=['POST'])
def add_comment(blog_id):
    data = request.get_json()
    content, user_id = data.get('content'), data.get('userId')
    if not all([content, user_id]):
        return jsonify({"message": "Comment content and user ID are required."}), 400
    db.session.add(Comment(content=content, user_id=user_id, blog_id=blog_id))
    db.session.commit()
    return jsonify({"message": "Comment added successfully."}), 201

@app.route('/api/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    user_id = request.get_json().get('userId')
    comment = Comment.query.get_or_404(comment_id)
    if comment.user_id != user_id:
        return jsonify({"message": "You are not authorized to delete this comment."}), 403
    db.session.delete(comment)
    db.session.commit()
    return jsonify({"message": "Comment deleted successfully."}), 200

# --- Authentication Endpoints ---
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
    login_type = data.get('loginType') # 'user', 'guest', or 'admin'

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
        "profile_image_url": f"{BACKEND_BASE_URL}{user.profile_image_url}" if user.profile_image_url else None
    }
    return jsonify({"message": "Login successful!", "user": user_data}), 200


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
