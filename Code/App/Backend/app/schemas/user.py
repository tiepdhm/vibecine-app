from pydantic import BaseModel, field_validator, FieldValidationInfo
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    DATA_SCIENTIST = "data_scientist"
    USER = "user"
    GUEST = "guest"

class UserBase(BaseModel):
    username: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company: Optional[str] = None
    is_active: bool = True
    role: UserRole = UserRole.USER 

class UserCreate(UserBase):
    password: str
    confirm_password: str

    @field_validator("confirm_password")
    def check_passwords_match(cls, confirm_password, info: FieldValidationInfo):
        if confirm_password != info.data["password"]:
            raise ValueError("Password confirmation does not match.")
        return confirm_password

class UserOut(UserBase):
    id: str

class UserResponse(BaseModel):
    id: str
    username: str
    role: UserRole

class LoginRequest(BaseModel):
    username: str
    password: str