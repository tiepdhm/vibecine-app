import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # Folder 'app': ./app/core/config.py
ROOT_DIR = os.path.dirname(BASE_DIR)  # Folder contains 'app', 'images', 'input', and 'models'
FRONTEND_ROOT_DIR = os.path.join(os.path.dirname(ROOT_DIR), 'Frontend')

class DatabaseConfig:
    MONGODB_URL = "mongodb+srv://vibecineapp123:review123@cluster0.zvnbk8w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    DB_NAME = "movie_review_app"

class PosterConfig:
    IMAGES_DIR = os.path.relpath(os.path.join(ROOT_DIR, 'images'), ROOT_DIR)
    FRONTEND_IMAGE_DIR = os.path.join(FRONTEND_ROOT_DIR, 'public', 'images')
    FRONTEND_ROOT_DIR = FRONTEND_ROOT_DIR

    # Ensure the images directory exists
    os.makedirs(os.path.join(ROOT_DIR, IMAGES_DIR), exist_ok=True)

class ModelConfig:
    MODELS_DIR = os.path.relpath(os.path.join(ROOT_DIR, 'models'), ROOT_DIR)
    SAVE_DIR = os.path.relpath(os.path.join(ROOT_DIR, MODELS_DIR, 'save'), ROOT_DIR)

    # Paths for saving models
    SAVE_SENTIMENT_MODEL_PATH = os.path.relpath(os.path.join(ROOT_DIR, SAVE_DIR, 'sentiment_model.pkl'), ROOT_DIR)
    SAVE_VECTORIZER_PATH = os.path.relpath(os.path.join(ROOT_DIR, SAVE_DIR, 'vectorizer.pkl'), ROOT_DIR)
    SAVE_LABEL_BINARIZER_PATH = os.path.relpath(os.path.join(ROOT_DIR, SAVE_DIR, 'label_binarizer.pkl'), ROOT_DIR)

    # Ensure the directories exist
    os.makedirs(os.path.join(ROOT_DIR, SAVE_DIR), exist_ok=True)

class DatasetConfig:
    INPUT_DIR = os.path.relpath(os.path.join(ROOT_DIR, 'input'), ROOT_DIR)
    IMDB_DATASET_PATH = os.path.relpath(os.path.join(ROOT_DIR, INPUT_DIR, 'IMDB-Dataset.csv'), ROOT_DIR)

    # Ensure the input directory exists
    os.makedirs(os.path.join(ROOT_DIR, INPUT_DIR), exist_ok=True)

class Settings:
    DATABASE = DatabaseConfig
    POSTER = PosterConfig
    MODEL = ModelConfig
    DATASET = DatasetConfig

settings = Settings()