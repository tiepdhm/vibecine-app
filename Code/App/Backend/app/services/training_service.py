import os
from app.schemas.training import TrainingInput, TrainingResult, PredictResult
from app.core.config import settings
from app.services.mongodb import db
from predictor import IMDB_SA_Module
from sklearn.model_selection import train_test_split
import pandas as pd

def train_model(training_input: TrainingInput, dataset_path: str) -> TrainingResult:
    """Train a model based on the input parameters and dataset."""
    # Load dataset
    df = pd.read_csv(dataset_path)
    X = df['review']
    y = df['sentiment']

    # Split dataset into train and test sets (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Initialize the sentiment analysis module
    sa_module = IMDB_SA_Module()

    # Extract alpha or use default
    alpha = training_input.alpha

    if training_input.algorithm == "naive_bayes":
        alpha = alpha if alpha is not None and alpha > 0 else 1.0  # Default alpha = 1.0 for Naive Bayes
        sa_module.train(X_train.tolist(), y_train.tolist(), model_type="naive_bayes", alpha=alpha)
    elif training_input.algorithm == "linear_svm":
        alpha = alpha if alpha is not None and alpha > 0 else 0.0001  # Default alpha = 0.0001 for Linear SVM
        sa_module.train(X_train.tolist(), y_train.tolist(), model_type="linear_svm", alpha=alpha)
    else:
        raise ValueError("Unsupported algorithm")

    # Evaluate the model on the test set
    f1 = sa_module.evaluate(X_test.tolist(), y_test.tolist(), return_f1=True)

    # Save the trained model, vectorizer, and LabelBinarizer
    model_path = os.path.join(settings.MODEL.SAVE_DIR, f"sentiment_model_{training_input.model_name}.pkl")
    vectorizer_path = os.path.join(settings.MODEL.SAVE_DIR, f"vectorizer_{training_input.model_name}.pkl")
    lb_path = os.path.join(settings.MODEL.SAVE_DIR, f"label_binarizer_{training_input.model_name}.pkl")
    sa_module.save_model(model_path, vectorizer_path, lb_path)

    # Save model metadata to MongoDB
    db.models.insert_one({
        "model_name": training_input.model_name,
        "f1_score": f1,
        "alpha": alpha,
        "in_use": False,
        "file_path": model_path
    })

    return TrainingResult(
        model_name=training_input.model_name,
        f1_score=f1,
        alpha=alpha,
        in_use=False,
        file_path=model_path
    )

def get_all_models() -> list[TrainingResult]:
    """Retrieve all models from the database."""
    models = db.models.find()
    return [TrainingResult(**model) for model in models]

def set_model_in_use(model_name: str) -> None:
    """Set a specific model as the one in use."""
    db.models.update_many({}, {"$set": {"in_use": False}})
    db.models.update_one({"model_name": model_name}, {"$set": {"in_use": True}})

def delete_model(model_name: str) -> None:
    """Delete a model and its associated files."""
    db.models.delete_one({"model_name": model_name})
    model_path = os.path.join(settings.MODEL.SAVE_DIR, f"sentiment_model_{model_name}.pkl")
    vectorizer_path = os.path.join(settings.MODEL.SAVE_DIR, f"vectorizer_{model_name}.pkl")
    lb_path = os.path.join(settings.MODEL.SAVE_DIR, f"label_binarizer_{model_name}.pkl")
    if os.path.exists(model_path):
        os.remove(model_path)
    if os.path.exists(vectorizer_path):
        os.remove(vectorizer_path)
    if os.path.exists(lb_path):
        os.remove(lb_path)

def predict_review(review: str) -> PredictResult:
    """Predict the sentiment of a single review using the in-use model."""
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

    # Predict sentiment
    sentiment = sa_module.predict_single(review)

    return PredictResult(review=review, sentiment=sentiment)