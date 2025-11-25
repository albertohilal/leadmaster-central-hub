import os
import requests
from PIL import Image
from io import BytesIO
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from utils import ensure_dir, sanitize_filename, log
import json
from tqdm import tqdm

NORM_DIR = os.path.join(os.path.dirname(__file__), '../output/normalized')
IMG_DIR = os.path.join(os.path.dirname(__file__), '../output/images')


def download_all_images():
    with open(os.path.join(NORM_DIR, 'products.json')) as f:
        products = json.load(f)
    for prod in tqdm(products, desc="Products"):
        sku = sanitize_filename(prod.get('sku', 'unknown'))
        prod_dir = os.path.join(IMG_DIR, sku)
        ensure_dir(prod_dir)
        for idx, url in enumerate(prod.get('image_urls', []), 1):
            jpg_path = os.path.join(prod_dir, f'{idx}.jpg')
            png_path = os.path.join(prod_dir, f'{idx}.png')
            # Check if either file already exists
            if os.path.exists(jpg_path) or os.path.exists(png_path):
                continue
            try:
                resp = requests.get(url, timeout=20)
                resp.raise_for_status()
                img = Image.open(BytesIO(resp.content))
                ensure_dir(prod_dir)
                if img.mode in ("RGBA", "LA") or ("transparency" in img.info):
                    img.save(png_path, "PNG")
                    log(f"Saved {png_path}")
                else:
                    img = img.convert("RGB")
                    img.save(jpg_path, "JPEG", quality=95)
                    log(f"Saved {jpg_path}")
            except Exception as e:
                log(f"[ERROR] Failed to download {url}: {e}")

if __name__ == "__main__":
    download_all_images()
