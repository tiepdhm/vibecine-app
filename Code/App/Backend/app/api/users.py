from fastapi import APIRouter, HTTPException
from app.services.user_service import *
from app.schemas.user import UserCreate, UserOut, UserRole, LoginRequest

router = APIRouter()

@router.post("/signup", response_model=UserOut)
async def signup(user_data: UserCreate):
    try:
        user_dict = create_user(user_data)
        return UserOut(**user_dict)  # Convert to UserOut model
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{username}", response_model=UserOut)
async def get_user(username: str):
    user = get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(**user)  # Convert to UserOut model

@router.post("/login")
async def login(login_request: LoginRequest):
    user = login_user(login_request.username, login_request.password)
    return {"message": f"User '{user.username}' logged in successfully", "role": user.role}

@router.put("/update")
async def update_user_account(update_data: dict):
    current_user = get_current_user() 
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guest cannot update information")
    
    success = update_user_info(update_data, current_user)
    if not success:
        raise HTTPException(status_code=404, detail="No changes were made to the user information")
    return {"message": f"User '{current_user.username}' has been updated"}

@router.post("/logout")
async def logout():
    current_user = get_current_user()  
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guest cannot log out")
    
    success = logout_user()
    if success:
        return {"message": f"User '{current_user.username}' has been logged out successfully"}
