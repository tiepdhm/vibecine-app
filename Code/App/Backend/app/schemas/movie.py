from pydantic import BaseModel
from typing import Optional, List

class MovieBase(BaseModel):
    name: str
    type: str
    language: str
    trailer_url: Optional[str] = None
    poster: Optional[str] = None
    description: Optional[str] = None

class MovieCreate(MovieBase):
    pass

class MovieOut(MovieBase):
    id: str
    positive_rate: Optional[float] = 0.0  # Percentage of positive reviews
    negative_rate: Optional[float] = 0.0  # Percentage of negative reviews
    total_reviews: Optional[int] = 0      # Total number of reviews
    positive_reviews: Optional[int] = 0   # Number of positive reviews
    negative_reviews: Optional[int] = 0   # Number of negative reviews
    word_cloud: Optional[List[dict]] = [] # Word cloud data