# ULACIT · Gestión de equipos

Base del proyecto académico de reservas, préstamos y devoluciones. Interfaz en español con panel principal, catálogo filtrable, reservas, préstamos, historial y configuración.

## Ejecutar en VS Code

Requisito: Node.js 24 LTS y npm.

```bash
npm ci
npm run dev
```

Abrir la dirección local que muestra Vite. En VS Code también se puede ejecutar la tarea **Iniciar aplicación**.

## Estado de esta entrega

- Preview responsive con datos ficticios y almacenamiento local en el navegador.
- Crear y cancelar reservas; validación de traslapes y horarios consecutivos.
- Registrar entrega durante el intervalo reservado y devolución en buen estado o con daños.
- Historial y exportación CSV.
- Lógica de dominio separada, 14 pruebas Jest y 4 recorridos Playwright.
- ESLint, Prettier, Vite y workflows de validación y GitHub Pages.
- Migración inicial propuesta con tablas, restricciones y RLS para Supabase.

**Pendiente:** autenticación real, CRUD de equipos, edición de reservas, adaptador Supabase y RPC transaccionales. La migración no se ha ejecutado contra una base real. La demo no es un sistema de producción.

## Validación

```bash
npm run format:check
npm run check
npx playwright install chromium
npm run test:e2e
```

## Ramas y revisión

`feature/TEC-01-base-aplicacion` contiene la base. `develop` parte del commit inicial; la base debe integrarse mediante PR aprobado por otra persona antes de crear las ramas de los módulos. `main` conserva la versión publicada.

1. Crear cada rama desde `develop` actualizado, después de integrar la base.
2. Usar `feature/US-XX-descripcion`, `fix/BUG-XX-descripcion`, `test/...` o `docs/...`.
3. Abrir PR hacia `develop`, con Issue, pruebas y evidencias.
4. Johan revisa los PR de sus compañeros. Liam revisa los de Johan; Fabricio valida criterios funcionales.
5. Integrar con squash. Publicar una entrega mediante PR de `develop` a `main`.

La protección de ramas y la configuración de GitHub Pages son ajustes del repositorio: incluir archivos YAML no los activa por sí solo. Seguir `docs/puesta-en-marcha.md`.

## Documentación

- [Arquitectura y límites de la demo](docs/arquitectura.md)
- [Plan del equipo y criterios de entrega](docs/plan-equipo.md)
- [Puesta en marcha y configuración remota](docs/puesta-en-marcha.md)
- [Base de datos y RPC pendientes](supabase/README.md)

## Integridad académica

Esta base fue elaborada con apoyo de IA. Cada integrante debe revisar, comprender y probar el código que incorpore; documentar ese apoyo en los PR. No introducir claves privadas ni datos personales reales en el repositorio.
