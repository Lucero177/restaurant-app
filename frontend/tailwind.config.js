/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Escala de fondo ultra limpia para resaltar neones
        slate: {
          50: '#f8f8fa',   // Fondo principal ultra limpio
          100: '#eef2f6',  // Superficie de tarjetas / contenedores
          200: '#d9e2ec',  // Bordes suaves
          800: '#1e293b',  // Texto secundario
          900: '#0f172a',  // Texto principal de alto contraste
        },
        // COLORES HIPER LLAMATIVOS Y BRILLANTES
        brand: {
          blue: '#00f0ff',    // Cian Neón Láser (Súper brillante)
          amber: '#ffe600',   // Amarillo Eléctrico / Sol Neón
          green: '#00ff66',   // Verde Lima Láser fluorescente
          red: '#ff0055',     // Magenta / Rojo Neón encendido
          orange: '#ff5500',  // Naranja Flama saturado
          purple: '#d69fef',  // Morado Ultra Eléctrico
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 30px rgba(0, 0, 0, 0.7)',
        'glow-blue': '0 0 20px rgba(0, 240, 255, 0.45)',
        'glow-orange': '0 0 20px rgba(255, 85, 0, 0.45)',
        'glow-green': '0 0 20px rgba(0, 255, 102, 0.45)',
        'glow-red': '0 0 20px rgba(255, 0, 85, 0.45)',
      },
    },
  },
  plugins: [],
}