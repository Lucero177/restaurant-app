from flask import Blueprint, jsonify
from collections import defaultdict
from api.models.db import list_pedidos

analytics_bp = Blueprint('analytics', __name__)


@analytics_bp.get('/kpis')
def get_kpis():
    pedidos = list_pedidos()
    total_pedidos = len(pedidos)
    ventas_totales = sum(p['total'] for p in pedidos)
    descuentos_totales = sum(p['descuentoAplicado'] for p in pedidos)

    conteo_por_plato = defaultdict(int)
    for p in pedidos:
        conteo_por_plato[p['plato']] += p['cantidad']
    plato_mas_vendido = max(conteo_por_plato.items(), key=lambda x: x[1])[0] if conteo_por_plato else '—'

    ticket_promedio = ventas_totales / total_pedidos if total_pedidos > 0 else 0

    return jsonify({
        'totalPedidos': total_pedidos,
        'ventasTotales': round(ventas_totales, 2),
        'descuentosTotales': round(descuentos_totales, 2),
        'platoMasVendido': plato_mas_vendido,
        'ticketPromedio': round(ticket_promedio, 2),
    })


@analytics_bp.get('/horas-pico')
def get_horas_pico():
    pedidos = list_pedidos()
    buckets = defaultdict(int)
    for p in pedidos:
        hora = p['hora'].split(':')[0] + ':00'
        buckets[hora] += 1
    data = [{'hora': h, 'pedidos': c} for h, c in sorted(buckets.items())]
    return jsonify(data)


@analytics_bp.get('/ventas-diarias')
def get_ventas_diarias():
    pedidos = list_pedidos()
    buckets = defaultdict(lambda: {'ventas': 0, 'descuentos': 0, 'bruto': 0})
    for p in pedidos:
        b = buckets[p['fecha']]
        b['ventas'] += p['total']
        b['descuentos'] += p['descuentoAplicado']
        b['bruto'] += p['bruto']
    data = [
        {'fecha': f, 'ventas': round(v['ventas'], 2), 'descuentos': round(v['descuentos'], 2), 'bruto': round(v['bruto'], 2)}
        for f, v in sorted(buckets.items())
    ]
    return jsonify(data)


@analytics_bp.get('/estados')
def get_por_estado():
    pedidos = list_pedidos()
    buckets = defaultdict(int)
    for p in pedidos:
        buckets[p['estado']] += 1
    return jsonify([{'estado': e, 'cantidad': c} for e, c in buckets.items()])


@analytics_bp.get('/participacion-platos')
def get_participacion_platos():
    pedidos = list_pedidos()
    buckets = defaultdict(int)
    total_unidades = 0
    for p in pedidos:
        buckets[p['plato']] += p['cantidad']
        total_unidades += p['cantidad']
    data = sorted(
        [
            {'plato': plato, 'unidades': u, 'porcentaje': round((u / total_unidades) * 100, 2) if total_unidades else 0}
            for plato, u in buckets.items()
        ],
        key=lambda x: x['unidades'],
        reverse=True,
    )
    return jsonify(data)


@analytics_bp.get('/insights')
def get_insights():
    """Insights automáticos consumidos por el Módulo 3 (tarjetas dinámicas)."""
    participacion = get_participacion_platos().get_json()
    horas_pico = get_horas_pico().get_json()
    kpis = get_kpis().get_json()

    if not participacion:
        return jsonify({'estrella': None, 'bajaRotacion': None, 'horaCritica': None, 'ticketPromedio': 0})

    estrella = participacion[0]
    baja_rotacion = participacion[-1]
    hora_critica = max(horas_pico, key=lambda x: x['pedidos']) if horas_pico else None

    return jsonify({
        'estrella': estrella,
        'bajaRotacion': baja_rotacion,
        'horaCritica': hora_critica,
        'ticketPromedio': kpis['ticketPromedio'],
    })
