import pymysql
import re
import os
from dotenv import load_dotenv

CATEGORY_MAP = {
    1: ["needle", "aguj", "cartridge", "cartridg"],
    2: ["machine", "maquin", "rotary", "pen", "wireless", "inalambr", "termocopi"],
    3: ["ink", "tinta", "pigment"],
    4: ["grip", "tip", "punta"],
    5: ["power", "fuente", "pedal", "battery"],
    6: ["glove", "guante", "wipe", "jab", "asep", "higiene"],
    7: ["cable", "clip", "adapter", "soporte", "holder"],
    8: ["film", "roll", "papel", "cinta", "descart", "protector"],
    9: ["motor", "spare", "repuesto", "reemplaz"],
}

load_dotenv()
DB = {
    "host": os.getenv("DB_HOST"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
    "charset": "utf8mb4",
}

def asignar_categoria(titulo, descripcion, tags, tipo):
    texto = f"{titulo} {descripcion or ''} {tags or ''} {tipo or ''}".lower()
    for cat_id, keywords in CATEGORY_MAP.items():
        for kw in keywords:
            if kw in texto:
                return cat_id
    return None

def clasificar():
    conn = pymysql.connect(**DB)
    cur = conn.cursor()
    cur.execute(
        "SELECT id, titulo, descripcion, tags, product_type FROM hs_productos"
    )
    productos = cur.fetchall()
    for p in productos:
        cat_id = asignar_categoria(
            titulo=p[1],
            descripcion=p[2],
            tags=p[3],
            tipo=p[4],
        )
        if cat_id:
            cur.execute(
                "UPDATE hs_productos SET categoria_id = %s WHERE id = %s",
                (cat_id, p[0])
            )
            print(f"[OK] Producto {p[0]} asignado a categoría {cat_id}")
        else:
            print(f"[WARN] Producto {p[0]} sin coincidencias")
    conn.commit()
    conn.close()

if __name__ == "__main__":
    clasificar()
