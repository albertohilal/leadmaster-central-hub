# Symlink or copy the PDF from /mnt/data/catalogo.pdf
import os
import shutil

src_pdf = '/mnt/data/catalogo.pdf'
dst_pdf = os.path.join(os.path.dirname(__file__), 'catalogo-habysupply/pdf/catalogo.pdf')

if not os.path.exists(dst_pdf):
    try:
        os.symlink(src_pdf, dst_pdf)
        print(f"Symlinked {src_pdf} to {dst_pdf}")
    except Exception:
        shutil.copy2(src_pdf, dst_pdf)
        print(f"Copied {src_pdf} to {dst_pdf}")
else:
    print(f"PDF already exists at {dst_pdf}")
