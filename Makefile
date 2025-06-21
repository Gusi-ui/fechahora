.PHONY: help install install-dev clean test format lint run build deploy

# Variables
PYTHON = python3
PIP = pip3
VENV = venv
PROJECT_NAME = planificador-horarios

# Colores para output
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
BLUE = \033[0;34m
NC = \033[0m # No Color

help: ## Mostrar esta ayuda
	@echo "$(BLUE)Comandos disponibles:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'

install: ## Instalar dependencias básicas
	@echo "$(BLUE)Instalando dependencias...$(NC)"
	$(PIP) install -r requirements.txt
	@echo "$(GREEN)✓ Dependencias instaladas$(NC)"

install-dev: ## Instalar dependencias de desarrollo
	@echo "$(BLUE)Instalando dependencias de desarrollo...$(NC)"
	$(PIP) install -e .[dev]
	@echo "$(GREEN)✓ Dependencias de desarrollo instaladas$(NC)"

venv: ## Crear entorno virtual
	@echo "$(BLUE)Creando entorno virtual...$(NC)"
	$(PYTHON) -m venv $(VENV)
	@echo "$(GREEN)✓ Entorno virtual creado$(NC)"
	@echo "$(YELLOW)Para activarlo: source $(VENV)/bin/activate$(NC)"

clean: ## Limpiar archivos generados
	@echo "$(BLUE)Limpiando archivos...$(NC)"
	rm -rf __pycache__
	rm -rf *.pyc
	rm -rf .pytest_cache
	rm -rf htmlcov
	rm -rf .coverage
	rm -rf build
	rm -rf dist
	rm -rf *.egg-info
	rm -f limpiar_planing.log
	@echo "$(GREEN)✓ Limpieza completada$(NC)"

test: ## Ejecutar tests
	@echo "$(BLUE)Ejecutando tests...$(NC)"
	pytest
	@echo "$(GREEN)✓ Tests completados$(NC)"

format: ## Formatear código con black
	@echo "$(BLUE)Formateando código...$(NC)"
	black .
	@echo "$(GREEN)✓ Código formateado$(NC)"

lint: ## Verificar estilo de código con flake8
	@echo "$(BLUE)Verificando estilo de código...$(NC)"
	flake8 .
	@echo "$(GREEN)✓ Verificación de estilo completada$(NC)"

type-check: ## Verificar tipos con mypy
	@echo "$(BLUE)Verificando tipos...$(NC)"
	mypy .
	@echo "$(GREEN)✓ Verificación de tipos completada$(NC)"

run: ## Ejecutar script de limpieza
	@echo "$(BLUE)Ejecutando script de limpieza...$(NC)"
	$(PYTHON) limpiar_planing.py
	@echo "$(GREEN)✓ Script ejecutado$(NC)"

build: ## Construir paquete
	@echo "$(BLUE)Construyendo paquete...$(NC)"
	$(PYTHON) setup.py sdist bdist_wheel
	@echo "$(GREEN)✓ Paquete construido$(NC)"

deploy: ## Desplegar en GitHub Pages (requiere configuración previa)
	@echo "$(BLUE)Desplegando en GitHub Pages...$(NC)"
	@echo "$(YELLOW)Nota: Esto requiere que GitHub Actions esté configurado$(NC)"
	git push origin main
	@echo "$(GREEN)✓ Despliegue iniciado$(NC)"

check: format lint type-check test ## Ejecutar todas las verificaciones

setup: venv install-dev ## Configurar entorno completo de desarrollo
	@echo "$(GREEN)✓ Entorno de desarrollo configurado$(NC)"
	@echo "$(YELLOW)Recuerda activar el entorno virtual: source $(VENV)/bin/activate$(NC)"

open-web: ## Abrir aplicación web en navegador
	@echo "$(BLUE)Abriendo aplicación web...$(NC)"
	@if command -v open >/dev/null 2>&1; then \
		open planing_limpio/index.html; \
	elif command -v xdg-open >/dev/null 2>&1; then \
		xdg-open planing_limpio/index.html; \
	elif command -v start >/dev/null 2>&1; then \
		start planing_limpio/index.html; \
	else \
		echo "$(YELLOW)No se pudo abrir automáticamente. Abre manualmente: planing_limpio/index.html$(NC)"; \
	fi

server: ## Iniciar servidor local para desarrollo
	@echo "$(BLUE)Iniciando servidor local...$(NC)"
	@if command -v python3 >/dev/null 2>&1; then \
		cd planing_limpio && python3 -m http.server 8000; \
	else \
		cd planing_limpio && python -m http.server 8000; \
	fi

# Comando por defecto
.DEFAULT_GOAL := help 