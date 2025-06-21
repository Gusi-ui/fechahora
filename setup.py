#!/usr/bin/env python3
"""
Setup script para el Planificador de Horarios.
"""

from setuptools import setup, find_packages
import os

# Leer el README
def read_readme():
    with open("README.md", "r", encoding="utf-8") as fh:
        return fh.read()

# Leer requirements
def read_requirements():
    with open("requirements.txt", "r", encoding="utf-8") as fh:
        return [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="planificador-horarios",
    version="1.0.0",
    author="Tu Nombre",
    author_email="tu.email@ejemplo.com",
    description="Una herramienta completa para gestionar y visualizar planificaciones de horarios de trabajo",
    long_description=read_readme(),
    long_description_content_type="text/markdown",
    url="https://github.com/tuusuario/fechahora",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Intended Audience :: End Users/Desktop",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Office/Business :: Scheduling",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Utilities",
    ],
    python_requires=">=3.7",
    install_requires=read_requirements(),
    extras_require={
        "dev": [
            "pytest>=6.0",
            "pytest-cov>=2.0",
            "black>=21.0",
            "flake8>=3.8",
            "mypy>=0.800",
        ],
    },
    entry_points={
        "console_scripts": [
            "limpiar-planificacion=limpiar_planing:main",
        ],
    },
    include_package_data=True,
    package_data={
        "": ["*.html", "*.css", "*.js", "*.csv", "*.json"],
    },
    keywords="planificacion horarios trabajo excel csv json web",
    project_urls={
        "Bug Reports": "https://github.com/tuusuario/fechahora/issues",
        "Source": "https://github.com/tuusuario/fechahora",
        "Documentation": "https://github.com/tuusuario/fechahora#readme",
    },
) 