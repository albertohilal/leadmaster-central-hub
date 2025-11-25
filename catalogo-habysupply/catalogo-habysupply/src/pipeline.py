
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fetch_products import fetch_all_products
from normalize_products import normalize_all
from download_images import download_all_images

from export_mysql import export_to_mysql
import subprocess

if __name__ == "__main__":
    fetch_all_products()
    normalize_all()
    download_all_images()
    export_to_mysql()
    # Clasificar productos en categorías
    subprocess.run(["python3", os.path.join(os.path.dirname(__file__), "clasificar_categorias.py")])
