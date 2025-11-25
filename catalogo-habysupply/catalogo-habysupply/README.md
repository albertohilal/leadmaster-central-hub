# catalogo-habysupply

A Python project to extract, normalize, and import the full Shopify product catalog from rosamonkey.com into MySQL, including all images and product data.

## Setup

### 1. Create a virtual environment
```bash
python3 -m venv venv
source venv/bin/activate
```

### 2. Install dependencies
```bash
pip install -r catalogo-habysupply/requirements.txt
```

### 3. Configure .env
Add your MySQL credentials to `.env`:
```
DB_HOST=localhost
DB_USER=user
DB_PASS=pass
DB_NAME=catalogo
```

## Running the Pipeline
Run the full workflow:
```bash
python catalogo-habysupply/src/pipeline.py
```

## Folder Structure
```
catalogo-habysupply/
│
├── src/
│   ├── fetch_products.py
│   ├── normalize_products.py
│   ├── download_images.py
│   ├── export_mysql.py
│   ├── utils.py
│   └── pipeline.py
│
├── output/
│   ├── raw_json/
│   ├── normalized/
│   └── images/
│
├── requirements.txt
├── README.md
└── .env
```

## Catalog Structure
- Raw Shopify JSON pages: `output/raw_json/products_page_X.json`
- All products merged: `output/raw_json/all_products.json`
- Normalized products: `output/normalized/products.json`
- Images: `output/images/<SKU>/1.jpg`, `2.jpg`, ...

## MySQL Schema
- `productos_haby` (id, sku, title, description, price, compare, stock, vendor, tags)
- `imagenes_haby` (id, producto_id, path)

## Troubleshooting Shopify Pagination
- Shopify limits products per page (max 250). The script paginates until no products are returned.
- If products are missing, check for API rate limits or store restrictions.
- The pipeline is idempotent: running twice does not duplicate data.
