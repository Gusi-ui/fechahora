#!/bin/bash

# Script de instalación para el Planificador de Horarios
# Este script configura el entorno de desarrollo

set -e  # Salir si hay algún error

echo "🚀 Instalando Planificador de Horarios..."
echo "=========================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si Python está instalado
check_python() {
    print_status "Verificando instalación de Python..."
    
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
        print_success "Python $PYTHON_VERSION encontrado"
    elif command -v python &> /dev/null; then
        PYTHON_VERSION=$(python --version | cut -d' ' -f2)
        print_success "Python $PYTHON_VERSION encontrado"
    else
        print_error "Python no está instalado. Por favor, instala Python 3.7 o superior."
        exit 1
    fi
}

# Verificar si pip está instalado
check_pip() {
    print_status "Verificando instalación de pip..."
    
    if command -v pip3 &> /dev/null; then
        print_success "pip3 encontrado"
        PIP_CMD="pip3"
    elif command -v pip &> /dev/null; then
        print_success "pip encontrado"
        PIP_CMD="pip"
    else
        print_error "pip no está instalado. Por favor, instala pip."
        exit 1
    fi
}

# Crear entorno virtual
create_venv() {
    print_status "Creando entorno virtual..."
    
    if [ -d "venv" ]; then
        print_warning "El directorio 'venv' ya existe. ¿Deseas eliminarlo y crear uno nuevo? (y/N)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            rm -rf venv
        else
            print_status "Usando entorno virtual existente"
            return
        fi
    fi
    
    python3 -m venv venv
    print_success "Entorno virtual creado"
}

# Activar entorno virtual
activate_venv() {
    print_status "Activando entorno virtual..."
    
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows
        source venv/Scripts/activate
    else
        # Unix/Linux/macOS
        source venv/bin/activate
    fi
    
    print_success "Entorno virtual activado"
}

# Instalar dependencias
install_dependencies() {
    print_status "Instalando dependencias Python..."
    
    if [ -f "requirements.txt" ]; then
        $PIP_CMD install --upgrade pip
        $PIP_CMD install -r requirements.txt
        print_success "Dependencias instaladas"
    else
        print_error "Archivo requirements.txt no encontrado"
        exit 1
    fi
}

# Instalar el proyecto en modo desarrollo
install_project() {
    print_status "Instalando proyecto en modo desarrollo..."
    
    $PIP_CMD install -e .
    print_success "Proyecto instalado"
}

# Probar la instalación
test_installation() {
    print_status "Probando la instalación..."
    
    # Ejecutar el script de limpieza
    if python limpiar_planing.py; then
        print_success "Script de limpieza ejecutado correctamente"
    else
        print_warning "El script de limpieza no pudo ejecutarse (puede ser normal si no hay archivos de datos)"
    fi
    
    # Verificar que los archivos generados existen
    if [ -f "planing_limpio.csv" ] || [ -f "planing_limpio.json" ]; then
        print_success "Archivos de datos generados correctamente"
    fi
}

# Crear archivo de configuración
create_config() {
    print_status "Creando archivo de configuración..."
    
    cat > .env.example << EOF
# Configuración del Planificador de Horarios
# Copia este archivo a .env y ajusta los valores según necesites

# Archivo de entrada por defecto
INPUT_FILE=horasFechas.xls - Planing.csv

# Archivos de salida
OUTPUT_CSV=planing_limpio.csv
OUTPUT_JSON=planing_limpio.json

# Configuración de logging
LOG_LEVEL=INFO
LOG_FILE=limpiar_planing.log

# URL del CSV para la aplicación web
CSV_URL=https://docs.google.com/spreadsheets/d/e/2PACX-1vRLuEf4cRYyKggenNb8HUvsE8RaMRMVRwh4IKOK83xEBdL8j9DXrP1D8E23kccJ7LibGenpY37SFKqS/pub?output=csv
EOF
    
    print_success "Archivo .env.example creado"
}

# Mostrar información final
show_final_info() {
    echo ""
    echo "🎉 ¡Instalación completada!"
    echo "=========================="
    echo ""
    echo "Para comenzar a usar el proyecto:"
    echo ""
    echo "1. Activa el entorno virtual:"
    echo "   source venv/bin/activate  # Linux/macOS"
    echo "   venv\\Scripts\\activate     # Windows"
    echo ""
    echo "2. Ejecuta el script de limpieza:"
    echo "   python limpiar_planing.py"
    echo ""
    echo "3. Abre la aplicación web:"
    echo "   open planing_limpio/index.html  # macOS"
    echo "   xdg-open planing_limpio/index.html  # Linux"
    echo "   start planing_limpio/index.html  # Windows"
    echo ""
    echo "4. Para desarrollo:"
    echo "   pip install -e .[dev]  # Instalar dependencias de desarrollo"
    echo ""
    echo "📚 Documentación: README.md"
    echo "🐛 Reportar bugs: https://github.com/Gusi-ui/fechahora/issues"
    echo ""
}

# Función principal
main() {
    echo "Iniciando instalación del Planificador de Horarios..."
    echo ""
    
    check_python
    check_pip
    create_venv
    activate_venv
    install_dependencies
    install_project
    test_installation
    create_config
    show_final_info
}

# Ejecutar función principal
main "$@" 