#!/usr/bin/env python3
"""
Script para limpiar y procesar archivos de planificación de horarios.

Este script toma un archivo CSV de planificación y lo convierte en formatos
más manejables para su uso en aplicaciones web y análisis de datos.

Autor: Gusi-ui
Fecha: 2024
"""

import pandas as pd
import logging
import sys
from pathlib import Path

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('limpiar_planing.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

def limpiar_planificacion(archivo_entrada, archivo_csv_salida, archivo_json_salida):
    """
    Limpia y procesa un archivo de planificación.
    
    Args:
        archivo_entrada (str): Ruta al archivo CSV de entrada
        archivo_csv_salida (str): Ruta para guardar el CSV limpio
        archivo_json_salida (str): Ruta para guardar el JSON limpio
    
    Returns:
        bool: True si el proceso fue exitoso, False en caso contrario
    """
    try:
        logging.info(f"Iniciando limpieza del archivo: {archivo_entrada}")
        
        # Verificar que el archivo existe
        if not Path(archivo_entrada).exists():
            logging.error(f"El archivo {archivo_entrada} no existe")
            return False
        
        # Leer el archivo completo
        logging.info("Leyendo archivo CSV...")
        df = pd.read_csv(archivo_entrada)
        logging.info(f"Archivo leído exitosamente. Dimensiones: {df.shape}")
        
        # Tomar la fila 13 (índice 12) como encabezado real
        logging.info("Procesando encabezados...")
        nuevo_encabezado = df.iloc[13]
        df_datos = df[14:].copy()
        df_datos.columns = nuevo_encabezado
        df_datos.reset_index(drop=True, inplace=True)
        
        # Eliminar columnas completamente vacías
        logging.info("Eliminando columnas vacías...")
        columnas_antes = len(df_datos.columns)
        df_datos.dropna(axis=1, how='all', inplace=True)
        columnas_despues = len(df_datos.columns)
        logging.info(f"Columnas eliminadas: {columnas_antes - columnas_despues}")
        
        # Transformar a formato largo (ideal para frontend y APIs)
        logging.info("Transformando a formato largo...")
        id_col = df_datos.columns[0]  # normalmente la columna A
        df_limpio = df_datos.melt(id_vars=[id_col], var_name="Fecha", value_name="Horas")
        
        # Eliminar filas vacías o sin datos de horas
        logging.info("Eliminando filas vacías...")
        filas_antes = len(df_limpio)
        df_limpio = df_limpio.dropna(subset=["Horas"])
        df_limpio = df_limpio[df_limpio["Horas"].astype(str).str.strip() != ""]
        filas_despues = len(df_limpio)
        logging.info(f"Filas eliminadas: {filas_antes - filas_despues}")
        
        # Guardar como CSV
        logging.info(f"Guardando CSV en: {archivo_csv_salida}")
        df_limpio.to_csv(archivo_csv_salida, index=False)
        
        # Guardar como JSON
        logging.info(f"Guardando JSON en: {archivo_json_salida}")
        df_limpio.to_json(archivo_json_salida, orient="records", date_format="iso")
        
        logging.info("Proceso completado exitosamente")
        logging.info(f"Archivos generados:")
        logging.info(f"  - CSV: {archivo_csv_salida}")
        logging.info(f"  - JSON: {archivo_json_salida}")
        logging.info(f"  - Registros procesados: {len(df_limpio)}")
        
        return True
        
    except FileNotFoundError:
        logging.error(f"No se pudo encontrar el archivo: {archivo_entrada}")
        return False
    except pd.errors.EmptyDataError:
        logging.error("El archivo CSV está vacío o no tiene datos válidos")
        return False
    except Exception as e:
        logging.error(f"Error inesperado: {str(e)}")
        return False

def main():
    """Función principal del script."""
    # Configuración de archivos
    archivo_entrada = "horasFechas.xls - Planing.csv"
    archivo_csv_salida = "planing_limpio.csv"
    archivo_json_salida = "planing_limpio.json"
    
    print("=" * 50)
    print("🔄 LIMPIADOR DE PLANIFICACIÓN DE HORARIOS")
    print("=" * 50)
    
    # Ejecutar limpieza
    if limpiar_planificacion(archivo_entrada, archivo_csv_salida, archivo_json_salida):
        print("\n✅ Proceso completado exitosamente!")
        print(f"📄 Archivos generados:")
        print(f"   - {archivo_csv_salida}")
        print(f"   - {archivo_json_salida}")
        print(f"📊 Revisa el archivo 'limpiar_planing.log' para más detalles")
    else:
        print("\n❌ Error durante el proceso")
        print("📋 Revisa el archivo 'limpiar_planing.log' para más detalles")
        sys.exit(1)

if __name__ == "__main__":
    main()
