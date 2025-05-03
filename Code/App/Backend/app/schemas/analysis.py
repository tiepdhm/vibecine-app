from pydantic import BaseModel
from typing import List

class SentimentAnalysisResult(BaseModel):
    total_reviews: int
    positive_reviews: int
    negative_reviews: int
    positive_rate: float  

class WordCloudData(BaseModel):
    word: str
    frequency: int

class AnalysisResponse(BaseModel):
    sentiment: SentimentAnalysisResult
    word_cloud: List[WordCloudData]