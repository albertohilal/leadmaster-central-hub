import os
import openai
from src.utils import log
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv('OPENAI_API_KEY')
OCR_DIR = os.path.join(os.path.dirname(__file__), '../output/ocr')
JSON_DIR = os.path.join(os.path.dirname(__file__), '../output/json')

def classify_blocks():
    for fname in sorted(os.listdir(OCR_DIR)):
        if fname.endswith('.txt'):
            with open(os.path.join(OCR_DIR, fname)) as f:
                text = f.read()
            # Example: call OpenAI Vision API (pseudo-code)
            # response = openai.Image.create(...)
            # For now, just log
            log(f"Classified {fname} (stub)")

if __name__ == "__main__":
    classify_blocks()
