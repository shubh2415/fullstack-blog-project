from app import app, db, User, Blog
from werkzeug.security import generate_password_hash
import os

def initialize_database():
    with app.app_context():
        print("Starting database initialization...")
        
        instance_path = os.path.join(os.path.dirname(__file__), 'instance')
        if not os.path.exists(instance_path):
            os.makedirs(instance_path)
            print("Instance folder created.")

        # --- IMPORTANT: This will drop all tables and recreate them.
        # This is useful for development when models change.
        # In production, you would use migrations (e.g., with Flask-Migrate).
        db.drop_all()
        db.create_all()
        print("Database tables created.")

        if not User.query.filter_by(user_type='Admin').first():
            admin_user = User(name='Admin', email='admin@example.com', password_hash=generate_password_hash('admin123'), user_type='Admin')
            db.session.add(admin_user)
            print("Admin user created (email: admin@example.com, pass: admin123).")
        else:
            print("Admin user already exists.")
        
        if not User.query.filter_by(email='guest@example.com').first():
            guest_user = User(name='Guest Author One', email='guest@example.com', password_hash=generate_password_hash('guest123'), user_type='Guest Author')
            db.session.add(guest_user)
            print("Guest Author user created (email: guest@example.com, pass: guest123).")
        else:
            print("Guest Author already exists.")

        if not User.query.filter_by(email='user@example.com').first():
            normal_user = User(name='Normal User One', email='user@example.com', password_hash=generate_password_hash('user123'), user_type='Normal User')
            db.session.add(normal_user)
            print("Normal user created (email: user@example.com, pass: user123).")
        else:
            print("Normal user already exists.")

        db.session.commit()

        if Blog.query.count() == 0:
            print("Adding dummy blogs...")
            admin = User.query.filter_by(user_type='Admin').first()
            guest = User.query.filter_by(email='guest@example.com').first()

            # --- UPDATE: Added category to dummy blogs ---
            blog1 = Blog(title="A Magical Introduction to React Hooks", content="React Hooks have empowered functional components to use state and lifecycle features...", image_url="/static/uploads/blogs/placeholder1.png", author=admin, category="Tech")
            blog2 = Blog(title="How to Build a Backend with Python Flask", content="Flask is a micro web framework written in Python. It is used for developing web applications...", image_url="/static/uploads/blogs/placeholder2.png", author=admin, category="Tech")
            blog3 = Blog(title="Travel Guide: A Journey to Leh-Ladakh", content="Leh-Ladakh, also known as 'Little Tibet', is famous for its beautiful mountains and monasteries...", image_url="/static/uploads/blogs/placeholder3.png", author=guest, category="Lifestyle")
            blog4 = Blog(title="Latest Tech News Roundup", content="From AI breakthroughs to the latest gadget releases, here's what's happening in the world of technology...", image_url="/static/uploads/blogs/placeholder1.png", author=admin, category="News")
            
            db.session.add_all([blog1, blog2, blog3, blog4])
            db.session.commit()
            print("4 dummy blogs have been added to the database.")
        else:
            print("Blogs already exist.")

if __name__ == '__main__':
    initialize_database()