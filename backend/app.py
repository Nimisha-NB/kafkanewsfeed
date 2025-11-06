from flask import Flask, jsonify, request
from auth import verify_token
from kafka import KafkaProducer
import json
import threading
from news_api import fetch_articles
from recommender import recommend_articles,user_history
from consumer import consume_user_events
from flask_cors import CORS
import firebase_admin
from firebase_admin import auth as firebase_auth ,credentials

app = Flask(__name__)
CORS(app) 

# Kafka producer
producer = KafkaProducer(
    bootstrap_servers='localhost:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# In-memory articles cache
articles = fetch_articles(page_size=20)

@app.route("/")
def home():
    return jsonify({"message": "Welcome to the News Recommender API!"})

@app.route("/get-articles", methods=["GET"])
def get_articles():
    return jsonify(articles)

@app.route("/user-event", methods=["POST"])
def user_event():
    data = request.json
    user_id = data.get("user_id")
    article_id = data.get("article_id")
    
    if not user_id or not article_id:
        return jsonify({"error": "user_id and article_id required"}), 400
    
    # Send event to Kafka
    producer.send("user-events", value={"user_id": user_id, "article_id": article_id})
    producer.flush()

    # ✅ Update history immediately so recommendations endpoint works instantly
    user_history[user_id].append(article_id)
    
    return jsonify({"status": "event sent"}), 200


@app.route("/recommendations/<user_id>", methods=["GET"])
def recommendations(user_id):
    recs = recommend_articles(user_id)
    return jsonify(recs)

@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        token = data.get("token")

        if not token:
            return jsonify({"error": "Missing token"}), 400

        # Verify the token with Firebase Admin SDK
        decoded_token = firebase_auth.verify_id_token(token)
        user_id = decoded_token["uid"]
        email = decoded_token.get("email")

        print(f"Verified user: {email} ({user_id})")

        # Optionally store user info or create an entry in DB
        return jsonify({
            "message": "Login successful",
            "user_id": user_id,
            "email": email
        }), 200

    except Exception as e:
        print("❌ Error verifying Firebase token:", e)
        return jsonify({"error": "Invalid or expired token"}), 401

# @app.route("/recommendations", methods=["GET"])
# @verify_token
# def recommendations():
#     # Extract UID from Firebase token
#     user_id = request.user["uid"]

#     # Pass it into your recommender function
#     recs = recommend_articles(user_id)

#     return jsonify(recs)


if __name__ == "__main__":
    threading.Thread(target=consume_user_events, daemon=True).start()
    app.run(debug=True, port=5000, host="0.0.0.0")
    