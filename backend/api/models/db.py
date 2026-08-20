"""
Capa de acceso a datos usando SQLite (sin ORM pesado, ideal para un
proyecto de restaurante de tamaño pequeño/mediano). Reemplázalo por
PostgreSQL + SQLAlchemy si el negocio crece.
"""

import sqlite3
import os
import uuid
import random
from datetime import datetime, date, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), 'restogestion.db')

ESTADOS_VALIDOS = ['Pendiente', 'En preparación', 'Entregado', 'Cancelado']


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS pedidos (
            id TEXT PRIMARY KEY,
            fecha TEXT NOT NULL,
            hora TEXT NOT NULL,
            plato TEXT NOT NULL,
            cantidad INTEGER NOT NULL,
            precio_unitario REAL NOT NULL,
            descuento_pct REAL DEFAULT 0,
            descuento_monto REAL DEFAULT 0,
            estado TEXT NOT NULL DEFAULT 'Pendiente',
            origen TEXT DEFAULT 'manual',
            creado_en TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

    # Si la tabla está vacía (primer arranque), sembramos datos demo
    # para que el dashboard y los reportes no arranquen en blanco.
    if not list_pedidos():
        seed_demo_data()


def seed_demo_data():
    """Genera ~7 días de pedidos de ejemplo, igual que el seed que
    antes vivía en el frontend (localStorage), ahora centralizado en el backend."""
    platos_precios = {
        'Lomo Saltado': 22,
        'Ají de Gallina': 20,
        'Ceviche Mixto': 25,
        'Arroz Chaufa': 18,
        'Causa Limeña': 15,
        'Tacu Tacu': 14,
    }
    conn = get_connection()
    hoy = date.today()
    for d in range(6, -1, -1):
        fecha = (hoy - timedelta(days=d)).isoformat()
        for _ in range(random.randint(8, 17)):
            plato = random.choice(list(platos_precios.keys()))
            hora = f"{random.randint(11, 20):02d}:{random.randint(0, 59):02d}"
            cantidad = random.randint(1, 4)
            estado = random.choice(ESTADOS_VALIDOS)
            conn.execute(
                '''INSERT INTO pedidos
                   (id, fecha, hora, plato, cantidad, precio_unitario, descuento_pct, descuento_monto, estado, origen, creado_en)
                   VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, 'demo', ?)''',
                (
                    str(uuid.uuid4()), fecha, hora, plato, cantidad,
                    platos_precios[plato], estado, datetime.utcnow().isoformat(),
                ),
            )
    conn.commit()
    conn.close()


def row_to_dict(row):
    bruto = row['cantidad'] * row['precio_unitario']
    descuento_aplicado = bruto * (row['descuento_pct'] / 100) + row['descuento_monto']
    total = max(bruto - descuento_aplicado, 0)
    return {
        'id': row['id'],
        'fecha': row['fecha'],
        'hora': row['hora'],
        'plato': row['plato'],
        'cantidad': row['cantidad'],
        'precioUnitario': row['precio_unitario'],
        'descuentoPct': row['descuento_pct'],
        'descuentoMonto': row['descuento_monto'],
        'estado': row['estado'],
        'origen': row['origen'],
        'creadoEn': row['creado_en'],
        'bruto': round(bruto, 2),
        'descuentoAplicado': round(descuento_aplicado, 2),
        'total': round(total, 2),
    }


def list_pedidos():
    conn = get_connection()
    rows = conn.execute('SELECT * FROM pedidos ORDER BY creado_en DESC').fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]


def create_pedido(data):
    pedido_id = str(uuid.uuid4())
    conn = get_connection()
    conn.execute(
        '''INSERT INTO pedidos
           (id, fecha, hora, plato, cantidad, precio_unitario, descuento_pct, descuento_monto, estado, origen, creado_en)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (
            pedido_id,
            data['fecha'],
            data['hora'],
            data['plato'],
            int(data['cantidad']),
            float(data['precioUnitario']),
            float(data.get('descuentoPct', 0)),
            float(data.get('descuentoMonto', 0)),
            data.get('estado', 'Pendiente'),
            data.get('origen', 'manual'),
            datetime.utcnow().isoformat(),
        ),
    )
    conn.commit()
    row = conn.execute('SELECT * FROM pedidos WHERE id = ?', (pedido_id,)).fetchone()
    conn.close()
    return row_to_dict(row)


def bulk_create_pedidos(rows):
    conn = get_connection()
    creados = []
    for r in rows:
        pedido_id = str(uuid.uuid4())
        estado = r.get('Estado') if r.get('Estado') in ESTADOS_VALIDOS else 'Pendiente'
        conn.execute(
            '''INSERT INTO pedidos
               (id, fecha, hora, plato, cantidad, precio_unitario, descuento_pct, descuento_monto, estado, origen, creado_en)
               VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, 'excel', ?)''',
            (
                pedido_id,
                r['Fecha'],
                r['Hora'],
                r['Plato'],
                int(r['Cantidad']),
                float(r['Precio']),
                estado,
                datetime.utcnow().isoformat(),
            ),
        )
        creados.append(pedido_id)
    conn.commit()
    conn.close()
    return len(creados)


def update_pedido(pedido_id, changes):
    conn = get_connection()
    existing = conn.execute('SELECT * FROM pedidos WHERE id = ?', (pedido_id,)).fetchone()
    if not existing:
        conn.close()
        return None

    fields_map = {
        'fecha': 'fecha', 'hora': 'hora', 'plato': 'plato',
        'cantidad': 'cantidad', 'precioUnitario': 'precio_unitario',
        'descuentoPct': 'descuento_pct', 'descuentoMonto': 'descuento_monto',
        'estado': 'estado',
    }
    updates, values = [], []
    for key, column in fields_map.items():
        if key in changes:
            updates.append(f'{column} = ?')
            values.append(changes[key])

    if updates:
        values.append(pedido_id)
        conn.execute(f'UPDATE pedidos SET {", ".join(updates)} WHERE id = ?', values)
        conn.commit()

    row = conn.execute('SELECT * FROM pedidos WHERE id = ?', (pedido_id,)).fetchone()
    conn.close()
    return row_to_dict(row)


def delete_pedido(pedido_id):
    conn = get_connection()
    conn.execute('DELETE FROM pedidos WHERE id = ?', (pedido_id,))
    conn.commit()
    conn.close()
