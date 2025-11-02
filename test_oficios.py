#!/usr/bin/env python3
import sys
sys.path.insert(0, '/app/shared')

from shared.core.database import SessionLocal
from shared.models.oficio import Oficio

db = SessionLocal()
try:
    results = db.query(Oficio).all()
    print(f"Total oficios: {len(results)}")
    for oficio in results:
        print(f"- {oficio.id}: {oficio.nombre}")
finally:
    db.close()
