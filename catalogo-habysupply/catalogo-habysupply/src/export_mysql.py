import os
import json
import mysql.connector
from dotenv import load_dotenv
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from utils import log, ensure_dir

NORM_DIR = os.path.join(os.path.dirname(__file__), '../output/normalized')
IMG_DIR = os.path.join(os.path.dirname(__file__), '../output/images')

load_dotenv()
DB_HOST = os.getenv('DB_HOST')
DB_USER = os.getenv('DB_USER')
DB_PASS = os.getenv('DB_PASSWORD')
DB_NAME = os.getenv('DB_NAME')

def export_to_mysql():
    conn = mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME
    )
    cursor = conn.cursor()
    # Create tables
    cursor.execute('''CREATE TABLE IF NOT EXISTS hs_productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        shopify_id BIGINT NOT NULL,
        sku VARCHAR(100) NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        handle VARCHAR(255) NOT NULL,
        descripcion LONGTEXT DEFAULT NULL,
        precio DECIMAL(12,2) DEFAULT 0.00,
        precio_comparacion DECIMAL(12,2) DEFAULT NULL,
        stock INT DEFAULT 0,
        vendor VARCHAR(255) DEFAULT NULL,
        tags TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT NULL,
        updated_at DATETIME DEFAULT NULL,
        UNIQUE KEY uq_sku (sku),
        KEY idx_vendor (vendor),
        KEY idx_handle (handle),
        KEY idx_shopify_id (shopify_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    ''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS hs_imagenes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT NOT NULL,
        ruta VARCHAR(500) NOT NULL,
        url_original TEXT DEFAULT NULL,
        orden INT DEFAULT 1,
        KEY idx_producto (producto_id),
        CONSTRAINT hs_imagenes_ibfk_1 FOREIGN KEY (producto_id) REFERENCES hs_productos (id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    ''')
    # Insert products
    with open(os.path.join(NORM_DIR, 'products.json')) as f:
        products = json.load(f)
    for prod in products:
        tags = prod['tags']
        if isinstance(tags, list):
            tags = ','.join(tags)
        cursor.execute('''REPLACE INTO hs_productos (shopify_id, sku, titulo, handle, descripcion, precio, precio_comparacion, stock, vendor, tags)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)''',
            (
                prod['id'],
                prod['sku'],
                prod['title'],
                prod['handle'],
                prod['description'],
                float(prod['price']) if prod['price'] else 0.0,
                float(prod['compare_at_price']) if prod['compare_at_price'] else None,
                int(prod['available']) if prod['available'] else 0,
                prod['vendor'],
                tags
            ))
    conn.commit()
    # Get producto_id for each SKU
    sku_to_id = {}
    cursor.execute('SELECT id, sku FROM hs_productos')
    for row in cursor.fetchall():
        sku_to_id[row[1]] = row[0]
    # Insert images
    for prod in products:
        sku = prod['sku']
        prod_id = sku_to_id.get(sku)
        prod_dir = os.path.join(IMG_DIR, sku)
        if not os.path.isdir(prod_dir) or not prod_id:
            continue
        for idx, fname in enumerate(sorted(os.listdir(prod_dir)), 1):
            img_path = os.path.join(prod_dir, fname)
            url_original = prod['image_urls'][idx-1] if idx-1 < len(prod['image_urls']) else None
            cursor.execute('''REPLACE INTO hs_imagenes (producto_id, ruta, url_original, orden) VALUES (%s, %s, %s, %s)''', (prod_id, img_path, url_original, idx))
    conn.commit()
    log(f"Exported {len(products)} products and images to hs_productos/hs_imagenes.")
    cursor.close()
    conn.close()

if __name__ == "__main__":
    export_to_mysql()
