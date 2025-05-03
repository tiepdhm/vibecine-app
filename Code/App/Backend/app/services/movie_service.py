import os
from fastapi import UploadFile
from app.services.mongodb import db
from app.schemas.movie import MovieCreate
from app.services.analysis_service import analyze_sentiment, generate_word_cloud
from app.core.config import settings
from bson import ObjectId

def create_movie(user_id: str, movie: MovieCreate, poster: UploadFile, poster_extension: str) -> dict:
    """Add a new movie to a user's list"""
    # Prepare movie data
    movie_data = movie.model_dump()
    movie_data["user_id"] = user_id

    # Insert movie into the database to generate the movie ID
    result = db.movies.insert_one(movie_data)
    movie_id = result.inserted_id  # Get the generated movie ID

    # Save the poster file
    poster_filename = f"{movie_id}{poster_extension}"  # Use movie_id as the filename
    poster_path = os.path.join(settings.POSTER.IMAGES_DIR, poster_filename)
    frontend_poster_path = os.path.join(settings.POSTER.FRONTEND_IMAGE_DIR, poster_filename)
    
    with open(frontend_poster_path, "wb") as f:
        f.write(poster.file.read())
    
    displayed_format_poster_path = f"/{poster_path.replace("\\", "/")}"

    # Update the movie document with the poster path
    db.movies.update_one(
        {"_id": movie_id},
        {"$set": {"poster": displayed_format_poster_path}}
    )

    # Return the movie data with the generated ID
    movie_data["id"] = str(movie_id)
    movie_data["poster"] = displayed_format_poster_path
    return movie_data

def get_movies_by_user(user_id: str) -> list:
    """Get all movies for a specific user"""
    movies = db.movies.find({"user_id": user_id})
    return [{"id": str(movie["_id"]), **movie} for movie in movies]

def get_movie_by_id(movie_id: str) -> dict:
    """Get a specific movie by its ID"""
    movie = db.movies.find_one({"_id": ObjectId(movie_id)})
    if movie:
        movie["id"] = str(movie["_id"])
        del movie["_id"]
    return movie

def delete_movie(movie_id: str) -> bool:
    """Delete a movie by its ID and remove the associated poster."""
    movie = db.movies.find_one({"_id": ObjectId(movie_id)})
    if not movie:
        return False

    # Delete the poster file
    poster_path = os.path.join(settings.POSTER.FRONTEND_ROOT_DIR, 'public', movie.get("poster").lstrip('/'))

    if poster_path and os.path.exists(poster_path):
        os.remove(poster_path)
    
    # Delete all reviews related to the movie
    db.reviews.delete_many({"movie_id": str(movie["_id"])})

    # Delete the movie from the database
    result = db.movies.delete_one({"_id": ObjectId(movie_id)})
    return result.deleted_count > 0

def update_movie(movie_id: str, update_data: dict) -> bool:
    """Update movie details"""
    result = db.movies.update_one(
        {"_id": ObjectId(movie_id)},
        {"$set": update_data}
    )
    return result.modified_count > 0

def run_movie_analysis(movie_id: str) -> dict:
    """Run analysis and update movie with analysis results, then return the updated data."""
    # Run sentiment analysis and word cloud generation
    sentiment = analyze_sentiment(movie_id)
    word_cloud = generate_word_cloud(movie_id)

    # Prepare analysis data
    analysis_data = {
        "sentiment": {
            "positive_rate": sentiment.positive_rate,
            "negative_rate": (sentiment.negative_reviews / sentiment.total_reviews) * 100 if sentiment.total_reviews > 0 else 0,
            "total_reviews": sentiment.total_reviews,
            "positive_reviews": sentiment.positive_reviews,
            "negative_reviews": sentiment.negative_reviews,
        },
        "word_cloud": [{"word": wc.word, "frequency": wc.frequency} for wc in word_cloud]
    }

    # Update movie with analysis results
    db.movies.update_one(
    {"_id": ObjectId(movie_id)},
    {"$set": {
        "positive_rate": analysis_data["sentiment"]["positive_rate"],
        "negative_rate": analysis_data["sentiment"]["negative_rate"],
        "total_reviews": analysis_data["sentiment"]["total_reviews"],
        "positive_reviews": analysis_data["sentiment"]["positive_reviews"],
        "negative_reviews": analysis_data["sentiment"]["negative_reviews"],
        "word_cloud": analysis_data["word_cloud"]
    }}
)

    return analysis_data