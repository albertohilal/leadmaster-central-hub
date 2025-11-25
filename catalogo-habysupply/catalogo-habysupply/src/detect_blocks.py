import cv2
import os
from src.utils import ensure_dir, log

PAGES_DIR = os.path.join(os.path.dirname(__file__), '../output/pages')
BLOCKS_DIR = os.path.join(os.path.dirname(__file__), '../output/blocks')

def detect_blocks():
    ensure_dir(BLOCKS_DIR)
    for fname in sorted(os.listdir(PAGES_DIR)):
        if fname.endswith('.png'):
            img_path = os.path.join(PAGES_DIR, fname)
            img = cv2.imread(img_path)
            h = img.shape[0]
            block1 = img[:h//2, :]
            block2 = img[h//2:, :]
            for i, block in enumerate([block1, block2], 1):
                out_path = os.path.join(BLOCKS_DIR, f'{fname[:-4]}_block{i}.png')
                cv2.imwrite(out_path, block)
                log(f"Saved {out_path}")

if __name__ == "__main__":
    detect_blocks()
