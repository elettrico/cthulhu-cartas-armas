# Banco de trabajo del proyecto

Esta carpeta conserva el material empleado para investigar, corregir y auditar
el mazo. No interviene en la generación normal mediante `rake`, pero puede ser
útil para sustituir imágenes, reconstruir créditos o ampliar la planilla.

## Contenido

- `research/`: fuentes editables y metadatos de procedencia de las imágenes.
- `tools/`: utilidades puntuales para buscar imágenes, normalizarlas, actualizar
  el Excel y regenerar los archivos de créditos y licencias.
- `node_modules`: enlace local a las dependencias de la instalación de Codex.
  Está ignorado por Git y solo funciona en esta máquina.
- `.artifact-node/`: segundo enlace local conservado como referencia del flujo
  usado para editar la planilla; también está ignorado por Git.

Las herramientas se ejecutan desde la raíz del repositorio. Por ejemplo:

```bash
node _workbench/tools/write_licenses_txt.mjs
```

Algunas herramientas de Excel importan `@oai/artifact-tool` desde el enlace
`_workbench/node_modules`; son utilidades de mantenimiento, no dependencias
necesarias para usar Squib.

Antes de decidir si esta carpeta debe publicarse, conviene distinguir entre:

- fuentes y manifiestos necesarios para reproducir las atribuciones;
- montajes y vistas previas, que pueden excluirse para reducir el tamaño;
- versiones intermedias que todavía puedan servir para futuras correcciones.

## Criterio de conservación

Se eliminaron candidatos rechazados, hojas de contacto, auditorías visuales,
copias de imágenes externas recuperables mediante sus referencias y versiones
que eran duplicados de `assets/weapons/`. Se conservaron:

- `editable-sources/vector/`: SVG y otras fuentes editables;
- `editable-sources/generated/`: originales de alta resolución de las cinco
  ilustraciones generadas, que no pueden reproducirse de forma idéntica;
- `final_manifest.json`, `queries.json` y `fuentes_nuevas_armas.md`: metadatos,
  búsquedas y fuentes empleadas.

Las carpetas `candidates/`, `leads/` y `generated-v3/` pueden ser recreadas por
las herramientas cuando vuelva a ser necesario investigar o regenerar activos.
