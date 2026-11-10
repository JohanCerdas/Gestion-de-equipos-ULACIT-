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

## Flujo de trabajo: solo develop y main

- Todos trabajan directamente en `develop`. Antes de empezar: `git switch develop` y `git pull --rebase origin develop`.
- Después de probar sus cambios: `git add .`, `git commit -m "feat: describir cambio"` y `git push origin develop`.
- Si otro compañero publicó cambios, ejecutar `git pull --rebase origin develop`, resolver conflictos y volver a probar antes de subir.
- No se crean ramas individuales ni se requieren PR hacia develop.
- Para entregar una versión se abre un PR de `develop` hacia `main`. Johan revisa los cambios y puede integrarlos sin aprobación ajena.
- Las pruebas automáticas informan los resultados; no son un bloqueo obligatorio configurado en GitHub.
- La publicación corresponde a main. El equipo debe revisar y probar antes de integrar.
- Al integrar develop en main, usar **Create a merge commit** para conservar el historial compartido entre las dos ramas.

## Documentación

- [Arquitectura y límites de la demo](docs/arquitectura.md)
- [Plan del equipo y criterios de entrega](docs/plan-equipo.md)
- [Puesta en marcha y configuración remota](docs/puesta-en-marcha.md)
- [Base de datos y RPC pendientes](supabase/README.md)

## Integridad académica

Esta base fue elaborada con apoyo de IA. Cada integrante debe revisar, comprender y probar el código que incorpore; documentar ese apoyo en los PR. No introducir claves privadas ni datos personales reales en el repositorio.
