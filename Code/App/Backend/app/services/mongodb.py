from pymongo import MongoClient
from app.core.config import settings

client = MongoClient(settings.DATABASE.MONGODB_URL)
db = client[settings.DATABASE.DB_NAME]