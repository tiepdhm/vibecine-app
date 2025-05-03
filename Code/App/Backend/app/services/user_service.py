import os
from fastapi import HTTPException
from app.schemas.user import UserCreate, UserOut
from app.services.mongodb import db
from app.core.config import settings

current_user = None

def create_user(user: UserCreate) -> dict:
    """Create new user (check if this username exists)"""
    if db.users.find_one({"username": user.username}):
        raise ValueError("Username exists")
    user_data = user.model_dump()
    result = db.users.insert_one(user_data)
    user_data["id"] = str(result.inserted_id)  # Convert ObjectId to string
    return user_data

def get_user_by_username(username: str) -> dict:
    """Get user info by username"""
    user = db.users.find_one({"username": username})
    if user:
        user["id"] = str(user["_id"])  # Convert ObjectId to string
        del user["_id"]  # Remove _id field
    return user

def login_user(username: str, password: str) -> UserOut:
    """Login into account"""
    global current_user
    user = get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user["is_active"]:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    if user["password"] != password:  
        raise HTTPException(status_code=401, detail="Incorrect password")
    current_user = UserOut(**user)
    return current_user

def get_current_user() -> UserOut:
    """Get info about current_user"""
    global current_user
    if not current_user:
        raise HTTPException(status_code=401, detail="Not logged in")
    return current_user

def delete_user(username: str) -> bool:
    """Delete a user and all related movies, reviews, and posters."""
    user = db.users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user["role"] in ["admin", "data_scientist"]:
        raise HTTPException(status_code=403, detail="Cannot delete admin or data scientist accounts")
    
    # Get all movies related to the user
    movies = list(db.movies.find({"user_id": str(user["_id"])}))
    movie_ids = [str(movie["_id"]) for movie in movies]

    # Delete all reviews related to the user's movies
    db.reviews.delete_many({"movie_id": {"$in": movie_ids}})

    # Delete all posters related to the user's movies
    for movie in movies:
        poster_path = os.path.join(settings.POSTER.FRONTEND_ROOT_DIR, 'public', movie.get("poster").lstrip('/'))
        if poster_path and os.path.exists(poster_path):
            os.remove(poster_path)

    # Delete all movies related to the user
    db.movies.delete_many({"user_id": str(user["_id"])})

    # Delete the user account
    result = db.users.delete_one({"username": username})
    return result.deleted_count > 0

def update_user_info(update_data: dict, current_user: UserOut) -> bool:
    """Update user information"""
    result = db.users.update_one(
        {"username": current_user.username},
        {"$set": update_data}
    )
    return result.modified_count > 0

def logout_user() -> bool:
    """Log out the current user"""
    global current_user
    if not current_user:
        raise HTTPException(status_code=401, detail="Not logged in")
    current_user = None
    return True

def get_all_users() -> list[UserOut]:
    """Retrieve all user accounts except guest accounts."""
    users = db.users.find({"role": {"$ne": "guest"}})  # Exclude users with role = "guest"
    return [
        UserOut(
            **{**user, "id": str(user["_id"])}  # Convert _id to id
        ) for user in users
    ]

def toggle_user_status(username: str) -> bool:
    """Toggle the is_active status of a user account, except admin and data scientist accounts."""
    user = db.users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user["role"] in ["admin", "data_scientist"]:
        raise HTTPException(status_code=403, detail="Cannot activate/deactivate admin or data scientist accounts")
    
    new_status = not user["is_active"]  # Toggle the current status
    result = db.users.update_one({"username": username}, {"$set": {"is_active": new_status}})
    return result.modified_count > 0

