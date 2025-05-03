from fastapi import APIRouter, HTTPException, Depends
from app.services.user_service import get_current_user, get_all_users, delete_user, toggle_user_status, get_user_by_username
from app.schemas.user import UserOut

router = APIRouter()

@router.get("/users", response_model=list[UserOut])
async def get_users(current_user: UserOut = Depends(get_current_user)):
    """
    Retrieve all user accounts except guest accounts.
    Only accessible by admin accounts.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can access this resource")
    
    return get_all_users()

@router.delete("/users/{username}")
async def delete_user_account(username: str, current_user: UserOut = Depends(get_current_user)):
    """
    Delete a user account, except admin and data scientist accounts.
    Also deletes all related movies, reviews, and posters.
    Only accessible by admin accounts.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can delete accounts")
    
    success = delete_user(username)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": f"User '{username}' has been deleted"}

@router.put("/users/{username}/status")
async def toggle_user_account_status(
    username: str,
    current_user: UserOut = Depends(get_current_user)
):
    """
    Toggle the is_active status of a user account, except admin and data scientist accounts.
    Only accessible by admin accounts.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can update account status")
    
    success = toggle_user_status(username)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Fetch the updated user to return the new status
    updated_user = get_user_by_username(username)
    return {"message": f"User '{username}' status has been updated", "is_active": updated_user["is_active"]}