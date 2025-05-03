from pydantic import BaseModel
from typing import Optional

class ReviewBase(BaseModel):
    content: str
    polarity: Optional[str] = None  # "positive" or "negative"

class ReviewCreate(ReviewBase):
    pass  

class ReviewOut(ReviewBase):
    id: str
    movie_id: str