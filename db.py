# db.py
import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables from .env file
load_dotenv() 

MONGO_URI = os.getenv("MONGO_URI")

# Initialize MongoDB Client and Database
client = MongoClient(MONGO_URI)
# Access the database named 'familyPlannerDB'
db = client.familyPlannerDB 

def get_db():
    """Returns the MongoDB database instance."""
    return db

# A helper to convert PyMongo's ObjectId to a string for JSON serialization
def serialize_doc(doc):
    """Converts a MongoDB document (dict) to a serializable dict."""
    if doc and '_id' in doc:
        # Convert ObjectId to a string
        doc['_id'] = str(doc['_id'])
    return doc