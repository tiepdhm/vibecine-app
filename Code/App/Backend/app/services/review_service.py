import csv
from app.services.mongodb import db
from app.schemas.review import ReviewCreate
from bson import ObjectId
from fastapi import UploadFile

def add_review(movie_id: str, review: ReviewCreate) -> dict:
    """Add a new review to a movie"""
    review_data = review.model_dump()
    review_data["movie_id"] = movie_id
    result = db.reviews.insert_one(review_data)
    review_data["id"] = str(result.inserted_id)
    return review_data

def get_reviews_by_movie(movie_id: str) -> list:
    """Get all reviews for a specific movie"""
    reviews = db.reviews.find({"movie_id": movie_id})
    return [{"id": str(review["_id"]), **review} for review in reviews]

def delete_review(review_id: str, movie_id: str) -> bool:
    """Delete a review by its ID and movie ownership"""
    result = db.reviews.delete_one({"_id": ObjectId(review_id), "movie_id": movie_id})
    return result.deleted_count > 0

def update_review(review_id: str, movie_id: str, update_data: dict) -> bool:
    """Update review details"""
    result = db.reviews.update_one(
        {"_id": ObjectId(review_id), "movie_id": movie_id},
        {"$set": update_data}
    )
    return result.modified_count > 0

def add_reviews_from_csv(movie_id: str, csv_file: UploadFile) -> list[dict]:
    """Add multiple reviews to a movie from a CSV file."""
    reviews = []
    try:
        # Read the CSV file
        content = csv_file.file.read().decode("utf-8").splitlines()
        reader = csv.DictReader(content)

        for row in reader:
            # Create a review object
            review = ReviewCreate(
                content=row["content"],  # Assuming the CSV has a "content" column
                polarity=None  # Polarity will be determined later
            )
            review_data = review.model_dump()
            review_data["movie_id"] = movie_id

            # Insert the review into the database
            result = db.reviews.insert_one(review_data)
            review_data["id"] = str(result.inserted_id)
            reviews.append(review_data)
    except Exception as e:
        raise ValueError(f"Error processing CSV file: {str(e)}")
    return reviews

def delete_multiple_reviews(review_ids: list[str], movie_id: str) -> dict:
    """Delete multiple reviews by their IDs and movie ownership."""
    # Convert review_ids to ObjectId
    object_ids = [ObjectId(review_id) for review_id in review_ids]

    # Perform multiple deletions
    result = db.reviews.delete_many({"_id": {"$in": object_ids}, "movie_id": movie_id})

    # Return the result
    return {
        "deleted_count": result.deleted_count,
        "failed_count": len(review_ids) - result.deleted_count
    }