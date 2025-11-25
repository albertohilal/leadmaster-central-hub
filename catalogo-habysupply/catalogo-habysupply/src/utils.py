import os
import re
import html

def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

def sanitize_filename(name):
    return re.sub(r'[^A-Za-z0-9_.-]', '_', str(name))

def html_to_text(html_content):
    text = re.sub(r'<[^>]+>', '', html_content)
    return html.unescape(text)

def log(msg):
    print(f"[LOG] {msg}")
import os

def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

def log(msg):
    print(f"[LOG] {msg}")

import re

def extract_sku(text):
    match = re.search(r'SKU:\s*([A-Z0-9\-]+)', text)
    return match.group(1) if match else None
