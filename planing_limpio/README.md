# Calculadora de Horas de Servicio

Esta aplicación web te permite calcular el balance de horas mensuales según tu plan, teniendo en cuenta días laborables, festivos y fines de semana. Permite personalizar los festivos y ajustar la configuración de horas por día.

## Características
- Cálculo automático de horas asignadas, consumidas y balance mensual.
- Gestión de festivos locales y personalizados.
- Interfaz moderna, responsiva y fácil de usar.
- Visualización clara de los resultados y detalles del mes.
- Favicon y manifest listos para PWA y máxima compatibilidad.

## Instalación y uso local
1. Clona el repositorio:
   ```sh
   git clone https://github.com/Gusi-ui/fechahora.git
   cd fechahora/planing_limpio
   ```
2. Arranca un servidor local (por ejemplo, con Python):
   ```sh
   python3 -m http.server 8000
   ```
3. Abre tu navegador en [http://localhost:8000](http://localhost:8000)

## Estructura de carpetas
```
planing_limpio/
├── css/
│   └── sheet.css
├── data/
│   └── holidays.json
├── favicons/
│   ├── favicon.svg
│   ├── favicon.ico
│   ├── favicon-96x96.png
│   ├── apple-touch-icon.png
│   ├── site.webmanifest
│   ├── web-app-manifest-192x192.png
│   └── web-app-manifest-512x512.png
├── index.html
├── main.js
└── README.md
```

## Despliegue en GitHub Pages
1. Sube los cambios a la rama `main` del repositorio.
2. Ve a **Settings > Pages** en GitHub y selecciona la carpeta `/planing_limpio` como fuente.
3. Espera unos minutos y accede a la URL que te proporciona GitHub Pages (ejemplo: `https://gusi-ui.github.io/fechahora/planing_limpio/`).

## Créditos
- Desarrollado por Gusi-ui y colaboradores.
- Festivos obtenidos de la web oficial del Ayuntamiento de Mataró.

## Licencia
MIT
