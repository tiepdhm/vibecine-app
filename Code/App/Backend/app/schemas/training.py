from pydantic import BaseModel
from typing import Optional

class TrainingInput(BaseModel):
    model_name: str
    algorithm: str  # "naive_bayes" or "linear_svm"
    alpha: Optional[float] = None  # Optional alpha parameter

class TrainingResult(BaseModel):
    model_name: str
    f1_score: float
    alpha: Optional[float] = None # Alpha is stored as a float after conversion
    in_use: bool = False  # Whether this model is the one currently in use
    file_path: str  # Path to the saved model file

class PredictInput(BaseModel):
    review: str  # The input review text

class PredictResult(BaseModel):
    review: str  # The input review text
    sentiment: str  # The predicted sentiment (e.g., "positive" or "negative")