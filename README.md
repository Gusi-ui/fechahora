# 📅 Planificador de Horarios

[![Python](https://img.shields.io/badge/Python-3.7+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/Gusi-ui/fechahora.svg)](https://github.com/Gusi-ui/fechahora/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Gusi-ui/fechahora.svg)](https://github.com/Gusi-ui/fechahora/network)
[![GitHub issues](https://img.shields.io/github/issues/Gusi-ui/fechahora.svg)](https://github.com/Gusi-ui/fechahora/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/Gusi-ui/fechahora.svg)](https://github.com/Gusi-ui/fechahora/pulls)

Una herramienta completa para gestionar y visualizar planificaciones de horarios de trabajo. Este proyecto incluye un script de limpieza de datos y una interfaz web para filtrar y visualizar la planificación por mes.

## ✨ Características

- **Limpieza automática de datos**: Script Python que procesa archivos Excel y los convierte a formatos más manejables
- **Interfaz web intuitiva**: Aplicación web responsive para visualizar la planificación
- **Filtrado por mes**: Filtra fácilmente la planificación por mes específico
- **Búsqueda en tiempo real**: Busca por nombre, fecha o horas
- **Estadísticas dinámicas**: Muestra estadísticas en tiempo real de los datos filtrados
- **Exportación a CSV**: Exporta los datos filtrados a formato CSV
- **Múltiples formatos de salida**: Exporta datos en CSV y JSON
- **Diseño responsive**: Funciona perfectamente en dispositivos móviles y de escritorio
- **Manejo de errores robusto**: Interfaz amigable para errores y estados de carga

## 🚀 Instalación Rápida

### Opción 1: Instalación Automática (Recomendada)

```bash
# Clonar el repositorio
git clone https://github.com/Gusi-ui/fechahora.git
cd fechahora

# Ejecutar script de instalación
./install.sh
```

### Opción 2: Instalación Manual

#### Prerrequisitos

- Python 3.7 o superior
- pip (incluido con Python)

#### Pasos de instalación

```bash
# Clonar el repositorio
git clone https://github.com/Gusi-ui/fechahora.git
cd fechahora

# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate  # Linux/macOS
# o
venv\Scripts\activate     # Windows

# Instalar dependencias
pip install -r requirements.txt

# Instalar proyecto en modo desarrollo
pip install -e .
```

## 📖 Uso

### 1. Limpieza de datos

Para procesar tu archivo Excel de planificación:

```bash
# Activar entorno virtual (si no está activado)
source venv/bin/activate

# Ejecutar script de limpieza
python limpiar_planing.py
```

El script:
- Lee el archivo `horasFechas.xls - Planing.csv`
- Limpia y estructura los datos
- Genera archivos `planing_limpio.csv` y `planing_limpio.json`
- Crea un archivo de log `limpiar_planing.log`

### 2. Visualización web

1. Abre el archivo `planing_limpio/index.html` en tu navegador
2. La aplicación cargará automáticamente los datos
3. Usa los filtros para:
   - Seleccionar un mes específico
   - Buscar por texto en cualquier campo
4. Visualiza las estadísticas en tiempo real
5. Exporta los datos filtrados a CSV

### 3. Desarrollo

```bash
# Instalar dependencias de desarrollo
pip install -e .[dev]

# Ejecutar tests (cuando estén disponibles)
pytest

# Formatear código
black .

# Verificar estilo de código
flake8 .
```

## 📁 Estructura del proyecto

```
fechahora/
├── limpiar_planing.py          # Script de limpieza de datos
├── horasFechas.xls             # Archivo Excel original
├── horasFechas.xls - Planing.csv # Datos CSV originales
├── planing_limpio.csv          # Datos limpios en CSV
├── planing_limpio.json         # Datos limpios en JSON
├── planing_limpio/             # Aplicación web
│   ├── index.html              # Interfaz principal
│   ├── planing_limpio.html     # Versión alternativa
│   └── resources/
│       └── sheet.css           # Estilos CSS
├── .github/workflows/          # GitHub Actions
│   └── deploy.yml              # Workflow de despliegue
├── .vscode/                    # Configuración VS Code
│   ├── settings.json           # Configuración del editor
│   └── extensions.json         # Extensiones recomendadas
├── requirements.txt            # Dependencias Python
├── setup.py                    # Configuración del paquete
├── install.sh                  # Script de instalación
├── README.md                   # Este archivo
├── LICENSE                     # Licencia MIT
├── CONTRIBUTING.md             # Guía de contribución
├── CODE_OF_CONDUCT.md          # Código de conducta
└── CHANGELOG.md                # Historial de cambios
```

## 🔧 Configuración

### Personalizar el archivo de entrada

Modifica la variable `archivo_entrada` en `limpiar_planing.py`:

```python
archivo_entrada = "tu_archivo.csv"  # Cambia por tu archivo
```

### Personalizar la URL de datos

En `planing_limpio/index.html`, actualiza la URL del CSV:

```javascript
const csvUrl = "URL_DE_TU_CSV";
```

### Variables de entorno

Copia `.env.example` a `.env` y ajusta las configuraciones:

```bash
cp .env.example .env
```

## 🎯 Características Técnicas

### Backend (Python)
- **pandas**: Procesamiento eficiente de datos
- **openpyxl**: Soporte para archivos Excel
- **logging**: Sistema de logs detallado
- **Manejo de errores**: Robustez en el procesamiento

### Frontend (HTML/CSS/JavaScript)
- **Diseño responsive**: Mobile-first approach
- **Filtros dinámicos**: Búsqueda en tiempo real
- **Estadísticas**: Cálculos automáticos
- **Exportación**: Descarga de datos filtrados
- **UX moderna**: Interfaz intuitiva y atractiva

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para contribuir:

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para más detalles.

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Gusi-ui** - [@Gusi-ui](https://github.com/Gusi-ui)

## 🙏 Agradecimientos

- [pandas](https://pandas.pydata.org/) por la excelente librería de manipulación de datos
- [openpyxl](https://openpyxl.readthedocs.io/) por el soporte de archivos Excel
- La comunidad de desarrolladores web por las mejores prácticas
- Todos los contribuyentes que ayudan a mejorar este proyecto

## 📞 Soporte

Si tienes alguna pregunta o problema, por favor:

1. Revisa los [Issues](https://github.com/Gusi-ui/fechahora/issues) existentes
2. Crea un nuevo Issue si tu problema no está resuelto
3. Contacta directamente si es necesario

## 🚀 Despliegue

### GitHub Pages

El proyecto incluye un workflow de GitHub Actions que despliega automáticamente la aplicación web en GitHub Pages cuando se hace push a la rama `main`.

### Despliegue Manual

Para desplegar manualmente:

1. Ejecuta el script de limpieza: `python limpiar_planing.py`
2. Sube el contenido de `planing_limpio/` a tu servidor web
3. Configura la URL del CSV en `index.html`

## 📊 Estado del Proyecto

![GitHub last commit](https://img.shields.io/github/last-commit/Gusi-ui/fechahora.svg)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/Gusi-ui/fechahora.svg)
![GitHub contributors](https://img.shields.io/github/contributors/Gusi-ui/fechahora.svg)

---

⭐ Si este proyecto te ha sido útil, ¡dale una estrella en GitHub! 