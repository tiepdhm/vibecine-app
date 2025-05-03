import pickle
import re
import numpy as np
import pandas as pd
from typing import List, Optional
import nltk
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.preprocessing import LabelBinarizer
from sklearn.linear_model import SGDClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
from bs4 import BeautifulSoup
from app.core.config import settings


class IMDB_SA_Module:
    """
    Module for IMDb Sentiment Analysis using various models.
    """
    def __init__(self):
        self.vectorizer = None
        self.model = None
        self.stopwords = set(stopwords.words('english'))
        self.tokenizer = nltk.tokenize.ToktokTokenizer()
        self.lb = LabelBinarizer()

    def load_vectorizer(self, path: str) -> None:
        """Load vectorizer from pickle file."""
        with open(path, 'rb') as f:
            self.vectorizer = pickle.load(f)

    def load_model(self, model_path: str, vectorizer_path: str, lb_path: str) -> None:
        """
        Load trained model, vectorizer, and LabelBinarizer from pickle files.

        Params:
        - model_path (str): Path to load the model.
        - vectorizer_path (str): Path to load the vectorizer.
        - lb_path (str): Path to load the LabelBinarizer.

        Returns:
        - None
        """
        with open(model_path, 'rb') as f:
            self.model = pickle.load(f)

        with open(vectorizer_path, 'rb') as f:
            self.vectorizer = pickle.load(f)

        with open(lb_path, 'rb') as f:
            self.lb = pickle.load(f)

    # Text preprocessing methods
    def denoise_text(self, text: str) -> str:
        """Remove HTML tags and square brackets."""
        text = BeautifulSoup(text, "html.parser").get_text()
        return re.sub(r'\[[^]]*\]', '', text)

    def remove_special_chars(self, text: str) -> str:
        """Remove special characters and digits."""
        text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
        return text

    def simple_stemmer(self, text: str) -> str:
        """Apply Porter stemming."""
        ps = nltk.stem.PorterStemmer()
        return ' '.join([ps.stem(word) for word in text.split()])

    def remove_stopwords(self, text: str) -> str:
        """Remove stopwords."""
        tokens = self.tokenizer.tokenize(text)
        filtered_tokens = [token.strip() for token in tokens if token.lower() not in self.stopwords]
        return ' '.join(filtered_tokens)

    def preprocess(self, texts: List[str]) -> List[str]:
        """Apply full preprocessing pipeline."""
        texts = [self.denoise_text(text) for text in texts]
        texts = [self.remove_special_chars(text) for text in texts]
        texts = [text.lower() for text in texts]
        texts = [self.simple_stemmer(text) for text in texts]
        texts = [self.remove_stopwords(text) for text in texts]
        return texts

    def vectorize(self, texts: List[str], vectorizer_type: str = 'tfidf') -> None:
        """Fit vectorizer (TF-IDF or BOW)."""
        if vectorizer_type == 'tfidf':
            self.vectorizer = TfidfVectorizer(min_df=1, max_df=1.0, ngram_range=(1, 3))
        else:
            self.vectorizer = CountVectorizer(min_df=1, max_df=1.0, ngram_range=(1, 3))
        return self.vectorizer.fit_transform(texts)

    def train(self, X: List[str], y: List[str], model_type: str, alpha: Optional[float] = None) -> None:
        """
        Train the model based on the specified algorithm.

        Params:
        - X (List[str]): Training data.
        - y (List[str]): Labels.
        - model_type (str): "naive_bayes" or "linear_svm".
        - alpha (Optional[float]): smoothing parameter for NB Classifier; regularization parameter for SGDClassifier (Linear SVM).
        """
        X = self.preprocess(X)
        y = self.lb.fit_transform(y).ravel()

        # Vectorize
        if not self.vectorizer:
            self.vectorize(X, vectorizer_type='tfidf')
        X_vec = self.vectorizer.transform(X)

        # Initialize model
        if model_type == "naive_bayes":
            alpha = alpha if alpha is not None and alpha > 0 else 1.0  # Default alpha = 1.0
            self.model = MultinomialNB(alpha=alpha)
        elif model_type == "linear_svm":
            alpha = alpha if alpha is not None and alpha > 0 else 0.0001  # Default alpha = 0.0001
            self.model = SGDClassifier(loss="hinge", alpha=alpha, max_iter=500, random_state=42)
        else:
            raise ValueError("Unsupported model type")

        self.model.fit(X_vec, y)

    def predict(self, X: List[str]) -> np.ndarray:
        """Predict sentiment."""
        X = self.preprocess(X)
        X_vec = self.vectorizer.transform(X)
        return self.model.predict(X_vec)

    def evaluate(self, X: List[str], y: List[str], return_f1: bool = False) -> float:
        """
        Evaluate the model and optionally return F1 score.

        Params:
        - X (List[str]): Test data.
        - y (List[str]): True labels.
        - return_f1 (bool): Whether to return the F1 score.

        Returns:
        - float: F1 score if return_f1 is True, otherwise None.
        """
        if self.model is None or self.vectorizer is None:
            raise Exception("Model or vectorizer is not loaded. Train the model before evaluating.")

        # Preprocess and vectorize the test data
        X = self.preprocess(X)
        X_vec = self.vectorizer.transform(X)

        # Predict and evaluate
        y_pred = self.model.predict(X_vec)
        y_true = self.lb.transform(y).ravel()
        f1 = f1_score(y_true, y_pred, average="weighted")
        print(f"Accuracy: {accuracy_score(y_true, y_pred):.4f}")
        print(classification_report(y_true, y_pred, target_names=self.lb.classes_))
        if return_f1:
            return f1
    
    def save_model(self, model_path: str, vectorizer_path: str, lb_path: str, version: str = None) -> None:
        """
        Save the trained model, vectorizer, and LabelBinarizer to disk with a version.

        Params:
        - model_path (str): Path to save the model.
        - vectorizer_path (str): Path to save the vectorizer.
        - lb_path (str): Path to save the LabelBinarizer.
        - version (str): Optional version string to include in the file name.

        Returns:
        - None
        """
        if self.model is None or self.vectorizer is None or self.lb is None:
            raise Exception("Model, vectorizer, or LabelBinarizer is not initialized. Train the model before saving.")

        # Add version to file names if provided
        if version:
            model_path = model_path.replace(".pkl", f"_{version}.pkl")
            vectorizer_path = vectorizer_path.replace(".pkl", f"_{version}.pkl")
            lb_path = lb_path.replace(".pkl", f"_{version}.pkl")

        # Save the model
        with open(model_path, 'wb') as model_file:
            pickle.dump(self.model, model_file)

        # Save the vectorizer
        with open(vectorizer_path, 'wb') as vectorizer_file:
            pickle.dump(self.vectorizer, vectorizer_file)

        # Save the LabelBinarizer
        with open(lb_path, 'wb') as lb_file:
            pickle.dump(self.lb, lb_file)

        print(f"Model saved to: {model_path}")
        print(f"Vectorizer saved to: {vectorizer_path}")
        print(f"LabelBinarizer saved to: {lb_path}")
    
    def predict_single(self, text: str) -> str:
        """
        Predict sentiment for a single text input.

        Params:
        - text (str): The input text to predict sentiment.

        Returns:
        - str: The predicted sentiment (e.g., 'positive' or 'negative').
        """
        if self.model is None or self.vectorizer is None:
            raise Exception("Model or vectorizer is not loaded. Load them before predicting.")

        # Preprocess the input text
        processed_text = self.preprocess([text])
        text_vec = self.vectorizer.transform(processed_text)

        # Predict sentiment
        prediction = self.model.predict(text_vec)
        return self.lb.inverse_transform(prediction)[0]

if __name__ == "__main__":
    # ### FOR TRAINING PART ###
    # # Load data
    # imdb_data = pd.read_csv(settings.DATASET.IMDB_DATASET_PATH)
    # train_reviews = imdb_data.review[:40000]
    # train_sentiments = imdb_data.sentiment[:40000]
    # test_reviews = imdb_data.review[40000:]
    # test_sentiments = imdb_data.sentiment[40000:]

    # # Initialize and train model
    # sa_module = IMDB_SA_Module()
    # sa_module.train(train_reviews.tolist(), train_sentiments.tolist(), model_type='linear_svm') # model_type='naive_bayes', 'linear_svm'
    
    # # Evaluate
    # sa_module.evaluate(test_reviews.tolist(), test_sentiments.tolist())

    # # Save the trained model, vectorizer, and LabelBinarizer with a custom version
    # sa_module.save_model(
    #     model_path=settings.MODEL.SAVE_SENTIMENT_MODEL_PATH,
    #     vectorizer_path=settings.MODEL.SAVE_VECTORIZER_PATH,
    #     lb_path=settings.MODEL.SAVE_LABEL_BINARIZER_PATH,
    #     version="SVM_123"
    # )

    
    

    ### FOR INFERENCE PART ###
    # Enter name of the model to load
    version = input("Enter the version of the model to load (e.g., 'SVM_a'): ").strip()

    # Load the trained model, vectorizer, and LabelBinarizer
    sa_module = IMDB_SA_Module()
    sa_module.load_model(
        model_path=settings.MODEL.SAVE_SENTIMENT_MODEL_PATH.replace(".pkl", f"_{version}.pkl"),
        vectorizer_path=settings.MODEL.SAVE_VECTORIZER_PATH.replace(".pkl", f"_{version}.pkl"),
        lb_path=settings.MODEL.SAVE_LABEL_BINARIZER_PATH.replace(".pkl", f"_{version}.pkl")
    )

    # Test prediction on a single text
    test_text = input("Enter a text to predict sentiment: ").strip()
    prediction = sa_module.predict_single(test_text)
    print(f"Predicted sentiment for '{test_text}': {prediction}")


    # # Test prediction on a list of texts from csv file
    # csv_file_path = 'test_data.csv'
    # output_file_path = 'result.csv'

    # # Read the CSV file
    # try:
    #     reviews_df = pd.read_csv(csv_file_path)
    #     if 'review' not in reviews_df.columns:
    #         raise ValueError("The CSV file must contain a 'review' column.")
    # except Exception as e:
    #     print(f"Error reading the CSV file: {e}")
    #     exit()

    # # Predict sentiment for each review
    # print("Predicting sentiments...")
    # reviews_df['predicted_sentiment'] = reviews_df['review'].apply(sa_module.predict_single)

    # # Save the results to a new CSV file
    # reviews_df.to_csv(output_file_path, index=False)
    # print(f"Predictions saved to: {output_file_path}")
