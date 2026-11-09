# Validación y pendientes de la base

## Alcance

La validación local cubre la demostración JavaScript. No equivale a pruebas de Supabase, RLS, concurrencia de servidor ni publicación remota.

## Comprobaciones

- ESLint y build Vite.
- 14 pruebas Jest: reservas válidas, traslape, límites consecutivos, cancelación, entradas inválidas, mantenimiento, entrega, devolución, daños y duplicados.
- 4 pruebas Playwright: panel y búsqueda, persistencia/cancelación de reserva, devolución con daños y navegación móvil sin desbordamiento horizontal.
- Revisión visual del panel principal.

## Dependencias

`npm audit --omit=dev` no reportó vulnerabilidades. La auditoría completa detectó avisos bajos/moderados en dependencias transitivas de Jest/ESLint. Se aplicó la actualización compatible disponible; siguen pendientes correcciones del árbol de herramientas. No se forzó el downgrade de Jest ni de ESLint que proponía npm. Revisar este punto antes de cerrar la entrega final del curso.

## Pendientes de infraestructura

- Autenticar GitHub para publicar ramas y abrir el PR.
- Configurar protecciones reales de main/develop y habilitar GitHub Pages.
- Crear Supabase de desarrollo/final, aplicar migraciones, implementar RPC y verificar permisos con usuarios separados.
- Integrar login, CRUD real, edición de reservas y adaptador de datos.
