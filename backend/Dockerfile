# Step 1: Ek stable Python version chunein
FROM python:3.11-slim

# Step 2: Container ke andar kaam karne ke liye ek directory banayein
WORKDIR /app

# Step 3: requirements.txt file ko copy karein
COPY requirements.txt .

# Step 4: Saari Python libraries install karein
RUN pip install --no-cache-dir -r requirements.txt

# Step 5: Baaki ka poora code container mein copy karein
COPY . .

# Step 6: Gunicorn ke liye Start Command set karein
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:10000"]
