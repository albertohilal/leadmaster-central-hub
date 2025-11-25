import os
import json
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from utils import ensure_dir, html_to_text, log

RAW_DIR = os.path.join(os.path.dirname(__file__), '../output/raw_json')
NORM_DIR = os.path.join(os.path.dirname(__file__), '../output/normalized')


def normalize_all():
    ensure_dir(NORM_DIR)
    all_path = os.path.join(RAW_DIR, 'all_products.json')
    with open(all_path) as f:
        data = json.load(f)
    products = data.get('products', [])
    norm_products = []
    for prod in products:
        norm = {
            'id': prod.get('id'),
            'title': prod.get('title'),
            'handle': prod.get('handle'),
            'description': html_to_text(prod.get('body_html', '')),
            'sku': prod.get('variants', [{}])[0].get('sku', ''),
            'price': prod.get('variants', [{}])[0].get('price', ''),
            'compare_at_price': prod.get('variants', [{}])[0].get('compare_at_price', ''),
            'available': prod.get('variants', [{}])[0].get('available', False),
            'vendor': prod.get('vendor', ''),
            'tags': prod.get('tags', ''),
            'image_urls': [img.get('src') for img in prod.get('images', []) if img.get('src')]
        }
        norm_products.append(norm)
    out_path = os.path.join(NORM_DIR, 'products.json')
    with open(out_path, 'w') as f:
        json.dump(norm_products, f, indent=2)
    log(f"Normalized {len(norm_products)} products.")

if __name__ == "__main__":
    normalize_all()
