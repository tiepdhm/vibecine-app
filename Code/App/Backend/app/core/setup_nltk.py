import nltk
from nltk.data import find

def ensure_nltk_resources():
    """
    Ensure that required NLTK resources are downloaded.
    """
    try:
        find('tokenizers/punkt')
        print("NLTK resource 'punkt' is already available.")
    except LookupError:
        print("Downloading 'punkt'...")
        nltk.download('punkt')

    try:
        find('corpora/stopwords')
        print("NLTK resource 'stopwords' is already available.")
    except LookupError:
        print("Downloading 'stopwords'...")
        nltk.download('stopwords')

if __name__ == "__main__":
    ensure_nltk_resources()
    print("All required NLTK resources are ready.")