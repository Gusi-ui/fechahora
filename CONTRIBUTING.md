# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir al Planificador de Horarios! Este documento te ayudará a entender cómo puedes participar en el proyecto.

## 📋 Cómo Contribuir

### 1. Reportar Bugs

Si encuentras un bug, por favor:

1. Busca en los [Issues existentes](https://github.com/Gusi-ui/fechahora/issues) para ver si ya fue reportado
2. Si no existe, crea un nuevo Issue con:
   - Título descriptivo
   - Descripción detallada del problema
   - Pasos para reproducir el bug
   - Información del sistema (navegador, sistema operativo, etc.)
   - Capturas de pantalla si es relevante

### 2. Solicitar Nuevas Funcionalidades

Para solicitar nuevas funcionalidades:

1. Busca en los [Issues existentes](https://github.com/Gusi-ui/fechahora/issues) para ver si ya fue solicitada
2. Crea un nuevo Issue con:
   - Título descriptivo
   - Descripción detallada de la funcionalidad
   - Casos de uso
   - Beneficios esperados

### 3. Contribuir con Código

#### Configuración del Entorno

1. Haz un fork del repositorio
2. Clona tu fork localmente:
   ```bash
   git clone https://github.com/tu-usuario/fechahora.git
   cd fechahora
   ```
3. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
4. Crea una rama para tu feature:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

#### Estándares de Código

- **Python**: Sigue PEP 8 para el estilo de código
- **JavaScript**: Usa ESLint y Prettier si es posible
- **HTML/CSS**: Mantén el código limpio y bien indentado
- **Comentarios**: Documenta funciones complejas y lógica importante
- **Nombres**: Usa nombres descriptivos para variables y funciones

#### Proceso de Desarrollo

1. **Desarrollo**: Trabaja en tu feature
2. **Testing**: Prueba tu código localmente
3. **Commits**: Haz commits pequeños y descriptivos:
   ```bash
   git commit -m "feat: agregar filtro por rango de fechas"
   ```
4. **Push**: Sube tus cambios:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
5. **Pull Request**: Crea un PR desde tu rama hacia `main`

#### Estructura de Commits

Usa el formato convencional de commits:

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato (espacios, etc.)
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests
- `chore:` Cambios en build, configuraciones, etc.

### 4. Documentación

Ayuda a mejorar la documentación:

- Corrige errores en el README
- Agrega ejemplos de uso
- Mejora la claridad de las instrucciones
- Traduce documentación a otros idiomas

## 🧪 Testing

Antes de hacer un PR, asegúrate de:

1. **Python**: Ejecuta el script de limpieza:
   ```bash
   python limpiar_planing.py
   ```

2. **Web**: Prueba la aplicación web:
   - Abre `planing_limpio/index.html` en diferentes navegadores
   - Verifica que los filtros funcionen correctamente
   - Prueba la funcionalidad de exportar

3. **Responsive**: Verifica que funcione en dispositivos móviles

## 📝 Pull Request

Al crear un PR, incluye:

1. **Descripción clara** de los cambios
2. **Screenshots** si hay cambios visuales
3. **Tests** si agregaste funcionalidades
4. **Documentación** actualizada si es necesario

### Template de PR

```markdown
## Descripción
Breve descripción de los cambios realizados.

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Mejora de documentación
- [ ] Refactorización

## Cambios realizados
- Lista de cambios específicos

## Testing
- [ ] Probé localmente
- [ ] Verifiqué en diferentes navegadores
- [ ] Probé en dispositivos móviles

## Screenshots (si aplica)
Agrega capturas de pantalla aquí.

## Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] Agregué tests si es necesario
- [ ] Actualicé la documentación
- [ ] Mis cambios no introducen nuevos bugs
```

## 🎯 Áreas de Mejora

Algunas áreas donde puedes contribuir:

### Frontend
- Mejorar la interfaz de usuario
- Agregar más filtros y opciones de visualización
- Implementar gráficos y estadísticas
- Mejorar la responsividad

### Backend
- Optimizar el procesamiento de datos
- Agregar validación de datos
- Implementar más formatos de exportación
- Agregar tests automatizados

### Documentación
- Mejorar el README
- Agregar tutoriales
- Crear documentación de API
- Traducir a otros idiomas

## 📞 Contacto

Si tienes preguntas sobre cómo contribuir:

1. Revisa los [Issues existentes](https://github.com/Gusi-ui/fechahora/issues)
2. Crea un nuevo Issue con la etiqueta `question`
3. Contacta directamente al mantenedor

## 🙏 Agradecimientos

¡Gracias por contribuir al proyecto! Cada contribución, por pequeña que sea, ayuda a hacer el Planificador de Horarios mejor para todos.

---

**Nota**: Este proyecto sigue el [Código de Conducta](CODE_OF_CONDUCT.md). Por favor, asegúrate de leerlo antes de contribuir. 