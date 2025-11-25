import fitz
import os
from PIL import Image
from src.utils import ensure_dir

PDF_PATH = os.path.join(os.path.dirname(__file__), '../pdf/catalogo.pdf')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '../output/pages')

def extract_pages(pdf_path, output_dir):
    ensure_dir(output_dir)
    doc = fitz.open(pdf_path)
    for i, page in enumerate(doc):
        pix = page.get_pixmap()
        img_path = os.path.join(output_dir, f'page_{i+1:03d}.png')
        pix.save(img_path)
        print(f"Saved {img_path}")

if __name__ == "__main__":
    extract_pages(PDF_PATH, OUTPUT_DIR)
