# auth.py
import jwt
from functools import wraps
from flask import request, jsonify
from bson.objectid import ObjectId # Needed to query by ID

SECRET_KEY = os.environ.get("SECRET_KEY") # Ensure this is loaded in app.py or db.py

def token_required(f):
    """
    A decorator function that checks for a valid JWT in the request headers
    and attaches the decoded user_id to the request object (g).
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # 1. Get the token from the Authorization header
        if 'Authorization' in request.headers:
            # Expecting format: 'Bearer <token>'
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
            
        if not token:
            return jsonify({'message': 'Authentication token is missing!'}), 401
        
        try:
            # 2. Decode and verify the token
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            # The 'user_id' is stored in the token payload
            current_user_id = data.get('user_id') 
            
            # 3. Attach the user_id to the request object for use in the route
            request.user_id = current_user_id
            
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid.'}), 401
        except Exception as e:
            # Catch other potential decoding errors
            print(f"Token decoding error: {e}")
            return jsonify({'message': 'Token processing failed.'}), 401

        # 4. If successful, proceed to the original route function
        return f(*args, **kwargs)

    return decorated