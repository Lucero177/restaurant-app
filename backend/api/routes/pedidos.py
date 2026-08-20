from flask import Blueprint, request, jsonify
from api.models.db import (
    list_pedidos, create_pedido, bulk_create_pedidos,
    update_pedido, delete_pedido, ESTADOS_VALIDOS
)

pedidos_bp = Blueprint('pedidos', __name__)

COLUMNAS_REQUERIDAS = ['Fecha', 'Hora', 'Plato', 'Cantidad', 'Precio', 'Estado']


@pedidos_bp.get('')
def get_pedidos():
    return jsonify(list_pedidos())


@pedidos_bp.post('')
def post_pedido():
    """Inserción manual de un pedido/plato individual."""
    data = request.get_json()
    required = ['fecha', 'hora', 'plato', 'cantidad', 'precioUnitario']
    missing = [f for f in required if f not in data or data[f] in (None, '')]
    if missing:
        return jsonify({'error': f'Campos faltantes: {", ".join(missing)}'}), 400

    pedido = create_pedido(data)
    return jsonify(pedido), 201


@pedidos_bp.post('/bulk')
def post_bulk():
    """
    Carga masiva desde Excel/CSV ya parseado en el frontend (JSON de filas).
    Valida columnas requeridas antes de insertar.
    """
    payload = request.get_json()
    rows = payload.get('rows', [])

    valid_rows, errors = [], []
    for idx, row in enumerate(rows):
        missing = [c for c in COLUMNAS_REQUERIDAS if row.get(c) in (None, '')]
        if missing:
            errors.append(f'Fila {idx + 2}: faltan columnas ({", ".join(missing)})')
            continue
        try:
            cantidad = int(row['Cantidad'])
            precio = float(row['Precio'])
            if cantidad <= 0 or precio < 0:
                raise ValueError()
        except (ValueError, TypeError):
            errors.append(f'Fila {idx + 2}: cantidad o precio inválido')
            continue
        valid_rows.append(row)

    imported = bulk_create_pedidos(valid_rows) if valid_rows else 0

    return jsonify({
        'imported': imported,
        'total': len(rows),
        'errors': errors,
    }), 200 if imported > 0 or not errors else 422


@pedidos_bp.patch('/<pedido_id>')
def patch_pedido(pedido_id):
    """Edición general: precio, cantidad, estado, etc."""
    changes = request.get_json()
    pedido = update_pedido(pedido_id, changes)
    if not pedido:
        return jsonify({'error': 'Pedido no encontrado'}), 404
    return jsonify(pedido)


@pedidos_bp.patch('/<pedido_id>/descuento')
def patch_descuento(pedido_id):
    """
    Acción directa desde la Tabla Viva: aplicar descuento por % o por monto.
    body: { "type": "pct" | "monto", "value": number }
    """
    body = request.get_json()
    tipo = body.get('type')
    value = max(float(body.get('value', 0)), 0)

    if tipo == 'pct':
        changes = {'descuentoPct': min(value, 100), 'descuentoMonto': 0}
    elif tipo == 'monto':
        changes = {'descuentoMonto': value, 'descuentoPct': 0}
    else:
        return jsonify({'error': 'type debe ser "pct" o "monto"'}), 400

    pedido = update_pedido(pedido_id, changes)
    if not pedido:
        return jsonify({'error': 'Pedido no encontrado'}), 404
    return jsonify(pedido)


@pedidos_bp.patch('/<pedido_id>/estado')
def patch_estado(pedido_id):
    body = request.get_json()
    estado = body.get('estado')
    if estado not in ESTADOS_VALIDOS:
        return jsonify({'error': f'Estado inválido. Usa uno de: {ESTADOS_VALIDOS}'}), 400
    pedido = update_pedido(pedido_id, {'estado': estado})
    if not pedido:
        return jsonify({'error': 'Pedido no encontrado'}), 404
    return jsonify(pedido)


@pedidos_bp.delete('/<pedido_id>')
def delete_pedido_route(pedido_id):
    delete_pedido(pedido_id)
    return '', 204
