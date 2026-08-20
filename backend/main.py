"""
RestoGestión API — Backend Flask (opcional)
--------------------------------------------
Este backend es un complemento opcional para dar persistencia real
(en vez de localStorage) a la app React. Expone endpoints REST
que replican exactamente las acciones del DataContext.jsx del frontend:
  - Listar / crear / editar / eliminar pedidos
  - Carga masiva desde Excel/CSV
  - Aplicar descuentos y cambiar estado
  - Endpoints agregados para KPIs, gráficos e insights

Ejecutar:
    cd backend
    python -m venv venv && source venv/bin/activate
    pip install -r requirements.txt
    python main.py
"""

from flask import Flask
from flask_cors import CORS
from api.routes.pedidos import pedidos_bp
from api.routes.analytics import analytics_bp
from api.models.db import init_db

def create_app():
    app = Flask(__name__)
    CORS(app)  # Permite peticiones desde el frontend Vite (localhost:5173)

    init_db()

    app.register_blueprint(pedidos_bp, url_prefix='/api/pedidos')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')

    @app.get('/api/health')
    def health():
        return {'status': 'ok', 'service': 'restogestion-api'}

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
