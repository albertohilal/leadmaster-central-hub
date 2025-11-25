import cv2
import os
from src.utils import ensure_dir, log

BLOCKS_DIR = os.path.join(os.path.dirname(__file__), '../output/blocks')
PRODUCTOS_DIR = os.path.join(os.path.dirname(__file__), '../output/productos')

def extract_images():
    ensure_dir(PRODUCTOS_DIR)
    for fname in sorted(os.listdir(BLOCKS_DIR)):
        if fname.endswith('.png'):
            img_path = os.path.join(BLOCKS_DIR, fname)
            img = cv2.imread(img_path)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            blur = cv2.GaussianBlur(gray, (5,5), 0)
            _, thresh = cv2.threshold(blur, 200, 255, cv2.THRESH_BINARY_INV)
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            for i, cnt in enumerate(contours):
                x, y, w, h = cv2.boundingRect(cnt)
                crop = img[y:y+h, x:x+w]
                out_path = os.path.join(PRODUCTOS_DIR, f'{fname[:-4]}_img{i+1}.png')
                cv2.imwrite(out_path, crop)
                log(f"Saved {out_path}")

if __name__ == "__main__":
    extract_images()
