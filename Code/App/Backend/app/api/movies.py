import os
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import Optional
from app.services.movie_service import (
    create_movie, get_movies_by_user, get_movie_by_id, delete_movie, update_movie
)
from app.services.review_service import add_reviews_from_csv
from app.schemas.movie import MovieCreate, MovieOut
from app.services.user_service import get_current_user
from app.schemas.user import UserOut, UserRole

router = APIRouter()

@router.post("/add", response_model=MovieOut)
async def add_movie(
    name: str = Form(...),
    type: str = Form(...),
    language: str = Form(...),
    trailer_url: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    reviews: UploadFile = File(...),  # Receive reviews as a CSV file
    poster: UploadFile = File(...),  # Receive poster file
    current_user: UserOut = Depends(get_current_user)
):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guest is not allowed to add movies")

    try:
        # Extract the file extension from the poster filename
        poster_extension = os.path.splitext(poster.filename)[1].lower()  # Get file extension (e.g., .jpg, .png)

        # Create the movie
        movie = MovieCreate(
            name=name,
            type=type,
            language=language,
            trailer_url=trailer_url,
            description=description,
            reviews=[]  # Reviews will be added from the CSV
        )
        movie_data = create_movie(current_user.id, movie, poster, poster_extension)

        # Add reviews from the CSV file
        try:
            add_reviews_from_csv(movie_data["id"], reviews)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Error processing reviews CSV: {str(e)}")

        return MovieOut(**movie_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list", response_model=list[MovieOut])
async def list_movies(current_user: UserOut = Depends(get_current_user)):
    movies = get_movies_by_user(current_user.id)
    return [MovieOut(**movie) for movie in movies]

@router.get("/details/{movie_id}", response_model=MovieOut)
async def get_movie(movie_id: str, current_user: UserOut = Depends(get_current_user)):
    movie = get_movie_by_id(movie_id)
    if not movie or movie["user_id"] != current_user.id:
        raise HTTPException(status_code=404, detail="Movie not found")
    return MovieOut(**movie)

@router.delete("/delete/{movie_id}")
async def remove_movie(movie_id: str, current_user: UserOut = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guest is not allowed to delete movies")

    success = delete_movie(movie_id)
    if not success:
        raise HTTPException(status_code=404, detail="Movie not found")
    return {"message": f"Movie '{movie_id}' has been deleted"}

@router.put("/update/{movie_id}")
async def update_movie_details(movie_id: str, update_data: dict, current_user: UserOut = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guest is not allowed to update movies")
    success = update_movie(movie_id, update_data)
    if not success:
        raise HTTPException(status_code=404, detail="Movie not found")
    return {"message": f"Movie '{movie_id}' has been updated"}