from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from app.services.review_service import (
    add_review, get_reviews_by_movie, delete_review, update_review, add_reviews_from_csv, delete_multiple_reviews
)
from app.schemas.review import ReviewCreate, ReviewOut
from app.services.user_service import get_current_user
from app.schemas.user import UserOut, UserRole

router = APIRouter()

@router.post("/add/{movie_id}", response_model=ReviewOut)
async def add_review_to_movie(movie_id: str, review: ReviewCreate, current_user: UserOut = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guest is not allowed to add reviews")
    review_data = add_review(movie_id, review)
    return ReviewOut(**review_data)

@router.get("/list/{movie_id}", response_model=list[ReviewOut])
async def list_reviews_for_movie(movie_id: str, current_user: UserOut = Depends(get_current_user)):
    reviews = get_reviews_by_movie(movie_id)
    return [ReviewOut(**review) for review in reviews]

@router.delete("/delete/{review_id}")
async def remove_review(review_id: str, movie_id: str, current_user: UserOut = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guest is not allowed to delete reviews")
    success = delete_review(review_id, movie_id)
    if not success:
        raise HTTPException(status_code=404, detail="Review not found or not authorized")
    return {"message": f"Review '{review_id}' has been deleted"}

@router.put("/update/{review_id}")
async def update_review_details(review_id: str, movie_id: str, update_data: dict, current_user: UserOut = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guest is not allowed to update reviews")
    success = update_review(review_id, movie_id, update_data)
    if not success:
        raise HTTPException(status_code=404, detail="Review not found or not authorized")
    return {"message": f"Review '{review_id}' has been updated"}

@router.post("/add_csv/{movie_id}", response_model=list[ReviewOut])
async def add_reviews_from_csv_to_movie(
    movie_id: str,
    csv_file: UploadFile = File(...),
    current_user: UserOut = Depends(get_current_user)
):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guest is not allowed to add reviews")

    try:
        reviews = add_reviews_from_csv(movie_id, csv_file)
        return [ReviewOut(**review) for review in reviews]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.delete("/delete-multiple")
async def remove_multiple_reviews(
    review_ids: list[str], 
    movie_id: str, 
    current_user: UserOut = Depends(get_current_user)
):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guest is not allowed to delete reviews")
    
    result = delete_multiple_reviews(review_ids, movie_id)

    # Check if there are any failed deletions
    if result["failed_count"] > 0:
        return {
            "message": "Some reviews could not be deleted",
            "deleted_count": result["deleted_count"],
            "failed_count": result["failed_count"]
        }
    
    return {"message": "All specified reviews have been deleted successfully"}