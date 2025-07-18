# Calculadora de Horas de Servicio

Esta aplicación web te permite calcular el balance de horas mensuales según tu plan, teniendo en cuenta días laborables, festivos y fines de semana. Permite personalizar los festivos, seleccionar exactamente qué días de la semana recibes servicio y cuántas horas, y ajustar la configuración de horas para festivos y fines de semana. Todo con una interfaz moderna y responsiva.

## Características
- Cálculo automático de horas asignadas, consumidas y balance mensual.
- Selección flexible de días de la semana y horas por día (con selectores visuales y en incrementos de 15 minutos).
- Gestión de festivos locales (Mataró) y personalizados.
- Visualización de festivos como tarjetas apiladas, con distinción visual entre festivos pasados y futuros.
- Formulario mejorado para añadir festivos, con botón de añadir rápido (+).
- Interfaz moderna, responsiva y optimizada para móvil y escritorio.
- Resultados claros y visuales, con balance en verde o rojo según el resultado.
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

## ¿Cómo funciona?
- Selecciona el año, mes y las horas asignadas al mes (con selector visual).
- Activa los días de la semana en los que recibes servicio y elige cuántas horas se realizan cada día.
- Si tienes servicio en festivos y fines de semana, activa la opción y selecciona las horas para esos días.
- Añade festivos personalizados fácilmente con el formulario y el botón "+".
- Consulta el balance mensual y los detalles de días laborables, festivos y horas realizadas.
- Los festivos pasados aparecen atenuados en la lista para mejor visualización.

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
