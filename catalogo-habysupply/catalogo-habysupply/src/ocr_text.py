import pytesseract
import os
from PIL import Image
from src.utils import ensure_dir, log, extract_sku

BLOCKS_DIR = os.path.join(os.path.dirname(__file__), '../output/blocks')
OCR_DIR = os.path.join(os.path.dirname(__file__), '../output/ocr')


def ocr_blocks():
    ensure_dir(OCR_DIR)
    for fname in sorted(os.listdir(BLOCKS_DIR)):
        if fname.endswith('.png'):
            img_path = os.path.join(BLOCKS_DIR, fname)
            img = Image.open(img_path)
            text = pytesseract.image_to_string(img)
            sku = extract_sku(text)
            out_path = os.path.join(OCR_DIR, f'{fname[:-4]}.txt')
            with open(out_path, 'w') as f:
                f.write(text)
            log(f"Saved OCR {out_path}, SKU: {sku}")

if __name__ == "__main__":
    ocr_blocks()
