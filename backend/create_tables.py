# create_tables.py

from app import app, db

# यह सुनिश्चित करने के लिए कि हम सही ऐप कॉन्टेक्स्ट में हैं
with app.app_context():
    print("Creating all database tables...")
    db.create_all()
    print("All tables created successfully!")
