# RestoGestión — Gestión de Pedidos y Analítica para Restaurante

Dashboard SaaS de gestión de pedidos y analítica en tiempo real, construido en **React + Vite**
con backend opcional en **Python (Flask)**.

## 🎨 Diseño

- Fondo base: Slate `#0f172a`
- Acento primario: Azul `#3b82f6`
- Acento de advertencia/descuentos: Ámbar `#f59e0b`
- Acento de éxito/ventas: Verde `#10b981`
- Tipografía: Inter

## 🔗 Arquitectura de interconexión

**`DataContext.jsx`** es la única fuente de verdad, y ahora está **conectado al backend Flask
vía `fetch`** (ya no usa `localStorage` para los pedidos). Todos los módulos (Carga, Tabla,
Dashboard, Reportes) consumen el mismo array `pedidos` mediante hooks derivados (`useMemo`).
Cualquier acción — carga masiva, inserción manual, descuento, edición o cambio de estado — llama
a un endpoint REST, actualiza el estado global con la respuesta del servidor, y eso recalcula
automáticamente KPIs, gráficos e insights en **todos** los módulos sin recargar la página.

> ⚠️ El backend Flask ahora es **obligatorio**: el frontend necesita `python main.py` corriendo
> en `localhost:5000` para poder leer y escribir pedidos. La sesión de login (`AuthContext.jsx`)
> sigue usando `localStorage` de forma independiente.

```
Acción del usuario (Módulo 1)
        │
        ▼
 DataContext → fetch() → API Flask (/api/pedidos...) → SQLite
        │                         │
        │        respuesta con el/los pedido(s) actualizado(s)
        ▼
 setPedidos(...) actualiza el estado global en memoria
        │
        ▼
 useMemo derivados: kpis, pedidosPorHora, ventasPorDia,
 pedidosPorEstado, participacionPlatos, insights
        │
        ▼
 Módulo 2 (Dashboard) + Módulo 3 (Reportes) se re-renderizan al instante
```

Si el backend no responde (apagado, puerto ocupado, etc.), la app muestra un banner rojo
persistente con botón "Reintentar" en vez de fallar silenciosamente.

## 📁 Estructura de carpetas

```
restaurant-app/
├── frontend/                        # React + Vite
│   ├── src/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Login/registro + sesión (localStorage)
│   │   │   └── DataContext.jsx      # Estado global de pedidos (fuente única de verdad)
│   │   ├── components/
│   │   │   ├── Auth/Login.jsx
│   │   │   ├── Layout/AppLayout.jsx # Sidebar + navegación
│   │   │   └── UI/                  # EstadoBadge, Modal, KpiCard
│   │   ├── modules/
│   │   │   ├── Module1/             # Carga, registro y gestión
│   │   │   │   ├── CargaMasiva.jsx      # Dropzone Excel/CSV + validación
│   │   │   │   ├── FormularioPedido.jsx # Inserción manual (modal)
│   │   │   │   ├── TablaPedidos.jsx     # Tabla viva + acciones (descuento, editar, estado)
│   │   │   │   └── GestionPedidos.jsx   # Vista contenedora del Módulo 1
│   │   │   ├── Module2/
│   │   │   │   └── DashboardOperativo.jsx # KPIs, horas pico, filtros
│   │   │   └── Module3/
│   │   │       ├── InsightsCards.jsx
│   │   │       ├── VentasDiariasChart.jsx
│   │   │       ├── EstadoPedidosChart.jsx
│   │   │       ├── ParticipacionPlatosChart.jsx
│   │   │       └── Reportes.jsx           # Vista contenedora + exportación
│   │   ├── utils/
│   │   │   ├── format.js            # formatCurrency, formatDate
│   │   │   ├── importUtils.js       # Parseo/validación Excel-CSV
│   │   │   └── exportUtils.js       # Exportar Excel (xlsx) y PDF (jspdf + html2canvas)
│   │   ├── App.jsx                  # Rutas + providers
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── backend/                         # Python + Flask (persistencia opcional)
    ├── main.py                      # App factory + registro de blueprints (entry point)
    ├── api/
    │   ├── models/db.py             # SQLite: CRUD de pedidos + cálculo de totales
    │   └── routes/
    │       ├── pedidos.py           # CRUD, carga masiva, descuentos, estado
    │       └── analytics.py         # KPIs, horas pico, ventas diarias, insights
    └── requirements.txt
```

## 🛠️ Librerías principales

**Frontend**
| Librería | Uso |
|---|---|
| `react-router-dom` | Rutas protegidas (login, pedidos, dashboard, reportes) |
| `recharts` | Gráficos de barras, dona y barras horizontales |
| `xlsx` (SheetJS) | Lectura de Excel para carga masiva y exportación a `.xlsx` |
| `papaparse` | Parseo de archivos `.csv` |
| `react-dropzone` | Zona de arrastrar y soltar para carga masiva |
| `jspdf` + `html2canvas` | Generación del PDF ejecutivo desde el DOM de Reportes |
| `lucide-react` | Iconografía |
| `uuid` | IDs únicos para pedidos |

**Backend**
| Librería | Uso |
|---|---|
| `Flask` | Servidor REST |
| `Flask-Cors` | Habilita llamadas desde `localhost:5173` |
| `sqlite3` (stdlib) | Persistencia ligera sin dependencias externas |

## 🚀 Instalación y ejecución

Se necesitan **dos terminales**: una para el backend y otra para el frontend.

### 1. Backend (Flask + SQLite) — arrancar primero

```bash
cd backend
python -m venv venv
source venv/bin/activate   # En Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

El servidor corre en `http://localhost:5000`. En el primer arranque crea `api/models/restogestion.db`
y siembra automáticamente ~7 días de pedidos de ejemplo si la tabla está vacía, así el dashboard
no arranca en blanco.

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. Usuario demo: `admin@resto.com` / `admin123` (la sesión de login
sigue siendo local al navegador). El `vite.config.js` ya incluye un proxy `/api` →
`http://localhost:5000`, así que no hace falta configurar CORS manualmente en desarrollo.

Si abres el frontend sin el backend corriendo, verás un banner rojo indicando que no hay
conexión, con un botón para reintentar en cuanto levantes `python main.py`.

### Endpoints del backend

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/pedidos` | Lista todos los pedidos con totales calculados |
| POST | `/api/pedidos` | Inserción manual de un pedido |
| POST | `/api/pedidos/bulk` | Carga masiva (rows validadas desde Excel/CSV) |
| PATCH | `/api/pedidos/:id` | Edición general (precio, cantidad, etc.) |
| PATCH | `/api/pedidos/:id/descuento` | Aplicar descuento (% o monto) |
| PATCH | `/api/pedidos/:id/estado` | Cambiar estado del pedido |
| DELETE | `/api/pedidos/:id` | Eliminar pedido |
| GET | `/api/analytics/kpis` | KPIs globales |
| GET | `/api/analytics/horas-pico` | Pedidos agrupados por hora |
| GET | `/api/analytics/ventas-diarias` | Ventas por día (bruto/descuento/neto) |
| GET | `/api/analytics/estados` | Conteo por estado |
| GET | `/api/analytics/participacion-platos` | % de participación por plato |
| GET | `/api/analytics/insights` | Insights automáticos (estrella, baja rotación, hora crítica) |

## 📊 Formato de archivo para carga masiva

El Excel/CSV debe contener exactamente estas columnas (el sistema normaliza mayúsculas/minúsculas y
espacios, y acepta fechas en formato `dd/mm/yyyy` o serial de Excel):

| Fecha | Hora | Plato | Cantidad | Precio | Estado |
|---|---|---|---|---|---|
| 2026-08-18 | 13:30 | Lomo Saltado | 2 | 22.00 | Entregado |

Filas con columnas faltantes o valores inválidos se reportan como errores sin bloquear la
importación de las filas válidas.
