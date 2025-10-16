import firebase_admin
from firebase_admin import credentials, auth
from functools import wraps
from flask import request, jsonify

# Initialize Firebase Admin SDK
cred = credentials.Certificate("firebase-key.json")
firebase_admin.initialize_app(cred)

# Middleware to verify token
def verify_token(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Missing Authorization header"}), 401

        try:
            # Expect token format: "Bearer <token>"
            token = token.split(" ")[1]
            decoded_token = auth.verify_id_token(token)
            request.user = decoded_token
        except Exception as e:
            return jsonify({"error": "Invalid or expired token", "details": str(e)}), 401

        return f(*args, **kwargs)
    return wrapper
