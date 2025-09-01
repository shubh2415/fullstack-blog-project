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

            # --- IMPORTANT: Replace this placeholder with your actual Cloudinary image URL ---
            dummy_image_url = "REPLACE_WITH_YOUR_CLOUDINARY_IMAGE_URL.jpg"
            dummy_image_public_id = "REPLACE_WITH_YOUR_IMAGE_PUBLIC_ID"

            blog1 = Blog(
                title="The Rise of Sustainable Cities 🏙️",
                content="""Around the world, a new trend is shaping our future: the rise of sustainable cities. 🌍
These aren't just cities with a few parks; they are entire urban areas redesigned for a greener tomorrow.
Think of buildings covered in solar panels ☀️ and vertical gardens growing fresh produce.
Public transport is shifting to electric buses 🚌 and extensive networks of cycling lanes.
Waste management is becoming smarter, with a focus on recycling and creating energy from trash. 🔥
These cities prioritize clean air and water for all their citizens.
Governments and innovators are working together to tackle climate change at a local level.
This movement is not just about being eco-friendly; it's about creating healthier and happier places to live. 😊
From Singapore to Copenhagen, these urban models are proving that a better future is possible.
It's a crucial news story that gives us hope for the planet. 🙏
This is a developing story, showing how human innovation can solve our biggest challenges.
The future of city living is green, and it's happening right now.""",
                image_url=dummy_image_url,
                image_public_id=dummy_image_public_id,
                author=admin,
                category="News"
            )
            
            blog2 = Blog(
                title="The Global Shift to a Four-Day Work Week 🗓️",
                content="""Is the traditional five-day work week becoming a thing of the past?
Across the globe, companies and even entire countries are experimenting with a four-day work week. 🏢
The results from recent trials are making headlines everywhere.
Studies are showing a significant increase in employee productivity and well-being. 😊
With an extra day off, people report lower stress levels and a better work-life balance.
This isn't about working less; it's about working smarter and more efficiently. 💡
Companies are finding that happy employees are more focused and motivated.
This shift could also have positive impacts on the environment, with fewer commutes. 🚗➡️🚲
Of course, there are challenges to figure out, like scheduling for customer-facing roles.
But the conversation is growing louder and many leaders are taking it seriously.
This news is a sign of a major cultural shift in our approach to work.
It asks us: could we achieve more by working less? 🤔""",
                image_url=dummy_image_url,
                image_public_id=dummy_image_public_id,
                author=admin,
                category="News"
            )

            blog3 = Blog(
                title="Artificial Intelligence (AI) is Now Your Personal Assistant 🤖",
                content="""Artificial Intelligence is no longer just a concept from science fiction movies. 🎬
Today, AI is evolving into the ultimate personal assistant, integrated into our daily lives.
Think of AI that doesn't just answer questions, but anticipates your needs.
It can manage your schedule, book appointments, and even suggest dinner recipes based on the food in your fridge. 🧑‍🍳
Advanced AI assistants can now handle complex tasks like planning a full vacation, finding the best flights ✈️ and hotels.
In the world of tech, these tools are becoming smarter and more conversational every day.
They are learning your preferences to provide a truly personalized experience.
Security and privacy 🔐 remain a key focus for developers to ensure your data is safe.
This technology aims to free up your time from small, daily tasks.
So you can focus on what’s truly important to you.
Welcome to a future where your digital assistant is as helpful as a real person.
The next generation of AI is not just smart; it's intuitive. ✨""",
                image_url=dummy_image_url,
                image_public_id=dummy_image_public_id,
                author=admin,
                category="Tech"
            )

            blog4 = Blog(
                title="The Magic of Early Mornings 🌅",
                content="""There's a special kind of magic that lives in the early morning hours. ✨
While the rest of the world is still asleep, you get a head start on the day.
The quietness of the morning is a perfect time for reflection and planning. 🤔
You can enjoy a hot cup of tea ☕ or coffee without any rush.
This is the time to set your intentions for the day ahead. 🎯
It’s a peaceful moment to gather your thoughts before the chaos begins.
Watching the sunrise can be an incredibly inspiring experience. 🌄
It reminds us that every day is a new beginning, full of possibilities.
Starting your day early can also lead to increased productivity. 🚀
You have more time to exercise, read, or work on a personal project.
Embrace the stillness and make the most of this golden hour. 🌟
It’s a simple change that can have a big impact on your life.""",
                image_url="https://res.cloudinary.com/dotihdxrh/image/upload/v1756724812/morning_1_hcvckk.jpg",
                image_public_id=dummy_image_public_id,
                author=admin,
                category="General"
            )

            db.session.add_all([blog1, blog2, blog3, blog4])
            db.session.commit()
            print("4 new dummy blogs have been added to the database.")
        else:
            print("Blogs already exist.")

if __name__ == '__main__':
    initialize_database()
