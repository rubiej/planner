# app.py
import os
import jwt
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
from db import get_db, serialize_doc
from auth import token_required # The decorator we created

# --- INITIAL SETUP ---
load_dotenv() # Load environment variables
app = Flask(__name__)
SECRET_KEY = os.environ.get("SECRET_KEY")
db = get_db() # Get the MongoDB database instance

# --- JWT HELPER FUNCTION ---
def create_jwt_token(user_id):
    """Generates a JWT token for the given user ID."""
    payload = {
        'user_id': str(user_id), # Store ID as string
        'exp': datetime.utcnow() + timedelta(days=7), # Token expires in 7 days
        'iat': datetime.utcnow() # Issued at timestamp
    }
    # Encode and sign the token
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

# --- AUTHENTICATION ROUTES ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Handles new user registration."""
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not all([name, email, password]):
        return jsonify({'success': False, 'message': 'Missing required fields.'}), 400

    # 1. Check if user already exists
    if db.users.find_one({'email': email}):
        return jsonify({'success': False, 'message': 'User already exists.'}), 400

    # 2. Hash the password using werkzeug.security (standard Flask practice)
    hashed_password = generate_password_hash(password, method='scrypt') # 'scrypt' is modern/strong
    
    # 3. Create the user document
    user_doc = {
        'name': name,
        'email': email,
        'password': hashed_password,
        # Create a default familyId for POC, using ObjectId type
        'familyId': ObjectId() 
    }
    
    result = db.users.insert_one(user_doc)
    
    # 4. Generate JWT
    token = create_jwt_token(result.inserted_id)

    # 5. Return success and token (excluding password hash)
    return jsonify({
        'success': True,
        'token': token,
        'user': {
            'id': str(result.inserted_id),
            'name': name,
            'email': email,
            'familyId': str(user_doc['familyId'])
        }
    }), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Handles user login and token generation."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'success': False, 'message': 'Please provide both email and password.'}), 400

    # 1. Find user by email
    user = db.users.find_one({'email': email})

    if not user:
        return jsonify({'success': False, 'message': 'Invalid credentials.'}), 401

    # 2. Verify password hash
    # check_password_hash compares the provided plain text password to the stored hash
    if not check_password_hash(user['password'], password):
        return jsonify({'success': False, 'message': 'Invalid credentials.'}), 401

    # 3. Generate JWT
    token = create_jwt_token(user['_id'])

    # 4. Success! Return token and user data
    return jsonify({
        'success': True,
        'token': token,
        'user': {
            'id': str(user['_id']),
            'name': user['name'],
            'email': user['email'],
            'familyId': str(user.get('familyId'))
        }
    }), 200

# --- EXAMPLE PROTECTED ROUTE ---
@app.route('/api/protected_test', methods=['GET'])
@token_required # Apply the decorator to protect this route
def protected_route():
    # request.user_id is available here because of the decorator
    return jsonify({
        'message': 'Access granted!', 
        'user_id': request.user_id
    })

# --- RUN APP ---
if __name__ == '__main__':
    # Add debug=True for development (only)
    app.run(debug=True)