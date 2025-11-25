import requests
import os
import json
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from utils import ensure_dir, log

BASE_URL = "https://www.rosamonkey.com/products.json"
RAW_DIR = os.path.join(os.path.dirname(__file__), '../output/raw_json')


def fetch_all_products():
    ensure_dir(RAW_DIR)
    all_products = []
    page = 1
    limit = 250
    while True:
        url = f"{BASE_URL}?page={page}&limit={limit}"
        log(f"Fetching {url}")
        resp = requests.get(url)
        if resp.status_code != 200:
            log(f"Failed to fetch page {page}: {resp.status_code}")
            break
        data = resp.json()
        products = data.get('products', [])
        if not products:
            break
        with open(os.path.join(RAW_DIR, f'products_page_{page}.json'), 'w') as f:
            json.dump(data, f, indent=2)
        all_products.extend(products)
        page += 1
    # Save merged products
    with open(os.path.join(RAW_DIR, 'all_products.json'), 'w') as f:
        json.dump({'products': all_products}, f, indent=2)
    log(f"Fetched {len(all_products)} products.")

if __name__ == "__main__":
    fetch_all_products()
