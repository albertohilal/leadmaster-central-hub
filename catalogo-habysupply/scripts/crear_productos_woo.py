import os
import pymysql
import requests
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

WOOCOMMERCE_URL = os.getenv('WOOCOMMERCE_URL')
WOOCOMMERCE_CONSUMER_KEY = os.getenv('WOOCOMMERCE_CONSUMER_KEY')
WOOCOMMERCE_CONSUMER_SECRET = os.getenv('WOOCOMMERCE_CONSUMER_SECRET')
DB_HOST = os.getenv('DB_HOST')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_NAME = os.getenv('DB_NAME')

# Opcional: Mapeo de categoria_id a WooCommerce category ID
def map_categoria_id(categoria_id):
    # TODO: Personalizar según mapeo real
    categoria_map = {
        1: 10,  # ejemplo: 1 -> 10
        2: 11,
        3: 12,
    }
    return categoria_map.get(categoria_id)

def get_productos():
    conn = pymysql.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME, charset='utf8mb4')
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT id, nombre, descripcion, precio, imagen_url, categoria_id FROM hs_productos WHERE wc_id IS NULL")
            return cursor.fetchall()
    finally:
        conn.close()

def crear_producto_woocommerce(producto):
    data = {
        "name": producto['nombre'],
        "description": producto['descripcion'] or "",
        "regular_price": str(producto['precio']) if producto['precio'] is not None else None,
    }
    # Imágenes
    if producto.get('imagen_url'):
        data["images"] = [{"src": producto['imagen_url']}]
    # Categorías
    categoria_wc = map_categoria_id(producto.get('categoria_id'))
    if categoria_wc:
        data["categories"] = [{"id": categoria_wc}]
    # Eliminar campos vacíos
    data = {k: v for k, v in data.items() if v}
    # POST a WooCommerce
    url = f"{WOOCOMMERCE_URL}/wp-json/wc/v3/products"
    try:
        response = requests.post(
            url,
            auth=(WOOCOMMERCE_CONSUMER_KEY, WOOCOMMERCE_CONSUMER_SECRET),
            json=data,
            timeout=30
        )
        if response.status_code == 201:
            return response.json()['id']
        else:
            print(f"[ERROR] Producto '{producto['nombre']}' no creado. Status: {response.status_code}. Respuesta: {response.text}")
            return None
    except Exception as e:
        print(f"[ERROR] Producto '{producto['nombre']}' excepción: {e}")
        return None

def guardar_wc_id(producto_id, wc_id):
    conn = pymysql.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME, charset='utf8mb4')
    try:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE hs_productos SET wc_id=%s WHERE id=%s", (wc_id, producto_id))
            conn.commit()
    finally:
        conn.close()

def main():
    productos = get_productos()
    print(f"Procesando {len(productos)} productos...")
    for producto in productos:
        if producto['precio'] is None:
            print(f"[SKIP] Producto '{producto['nombre']}' sin precio.")
            continue
        wc_id = crear_producto_woocommerce(producto)
        if wc_id:
            guardar_wc_id(producto['id'], wc_id)
            print(f"[OK] Producto '{producto['nombre']}' creado en WooCommerce con ID {wc_id}.")

if __name__ == "__main__":
    main()
