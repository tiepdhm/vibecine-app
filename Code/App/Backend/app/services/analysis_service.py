import re
from app.services.mongodb import db
from app.schemas.analysis import SentimentAnalysisResult, WordCloudData
from app.core.config import settings
from collections import Counter
from predictor import IMDB_SA_Module 
from nltk.corpus import stopwords

# Ensure stopwords are downloaded
import nltk
nltk.download("stopwords")

def analyze_sentiment(movie_id: str) -> SentimentAnalysisResult:
    """Analyze sentiment for all reviews of a movie using the in-use model."""
    # Retrieve the model marked as in-use
    in_use_model = db.models.find_one({"in_use": True})
    if not in_use_model:
        raise ValueError("No model is currently marked as in-use.")

    # Load the model, vectorizer, and LabelBinarizer
    model_path = in_use_model["file_path"]
    vectorizer_path = model_path.replace("sentiment_model", "vectorizer")
    lb_path = model_path.replace("sentiment_model", "label_binarizer")

    sa_module = IMDB_SA_Module()
    sa_module.load_model(model_path, vectorizer_path, lb_path)

    # Fetch all reviews for the movie
    reviews = list(db.reviews.find({"movie_id": movie_id}))
    total_reviews = len(reviews)

    # Predict sentiment for each review
    for review in reviews:
        if "polarity" not in review or review["polarity"] is None:  # Check if polarity is missing or null
            review["polarity"] = sa_module.predict_single(review["content"])
            db.reviews.update_one({"_id": review["_id"]}, {"$set": {"polarity": review["polarity"]}})

    # Calculate sentiment statistics
    positive_reviews = sum(1 for review in reviews if review.get("polarity") == "positive")
    negative_reviews = total_reviews - positive_reviews
    positive_rate = (positive_reviews / total_reviews) * 100 if total_reviews > 0 else 0

    return SentimentAnalysisResult(
        total_reviews=total_reviews,
        positive_reviews=positive_reviews,
        negative_reviews=negative_reviews,
        positive_rate=positive_rate
    )

def generate_word_cloud(movie_id: str) -> list[WordCloudData]:
    """Generate word cloud data for a movie's reviews"""
    reviews = db.reviews.find({"movie_id": movie_id})
    all_words = " ".join(review["content"] for review in reviews)

    # Clean the text: remove unwanted characters and HTML-like tags
    cleaned_text = re.sub(r"[^\w\s]", " ", all_words)  # Remove punctuation
    cleaned_text = re.sub(r"<[^>]+>", " ", cleaned_text)  # Remove HTML tags like <br>
    cleaned_text = re.sub(r"\bbr\b", " ", cleaned_text, flags=re.IGNORECASE)  # Remove standalone 'br'
    cleaned_text = re.sub(r"\s+", " ", cleaned_text)  # Normalize whitespace

    # Split into words
    words = cleaned_text.split()

    # Load stopwords
    stop_words = set(stopwords.words("english"))

    # Filter out stopwords
    filtered_words = [word for word in words if word.lower() not in stop_words]

    # Count word frequencies
    word_counts = Counter(filtered_words)
    return [WordCloudData(word=word, frequency=count) for word, count in word_counts.most_common(20)]

