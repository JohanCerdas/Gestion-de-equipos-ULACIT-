# Base de datos: esquema inicial propuesto

La migración no se ha aplicado a un servicio real. No se dispone de un proyecto Supabase ni de sus credenciales en este checkout. Validar en desarrollo antes de considerarla aprobada.

## Decisiones

- `equipment.condition` representa condición física, no disponibilidad por horario.
- Intervalos `[inicio, fin)`: dos reservas consecutivas están permitidas.
- PostgreSQL impide traslapes con una restricción de exclusión, incluso ante concurrencia.
- Solo hay un préstamo activo por equipo y una devolución por préstamo.
- RLS en todas las tablas. Usuarios leen sus propios movimientos; administradores pueden leer todo.
- El usuario no puede asignarse el rol administrador mediante metadatos ni actualizar `role`. El primer administrador se asigna desde una sesión administrativa de confianza.
- No se concede escritura directa sobre reservas, préstamos, devoluciones ni historial. Las futuras RPC deben validar y escribir todo en una sola transacción.

## Trabajo de Johan: siguiente migración

Implementar y probar RPC `create_reservation`, `cancel_reservation`, `update_reservation`, `checkout_equipment`, `return_equipment`.

1. Verificar `auth.uid()` y rol dentro de cada RPC; no confiar en IDs de usuario enviados por el navegador.
2. Bloquear equipo/reserva/préstamo con `FOR UPDATE` en un orden consistente.
3. Verificar que el equipo de préstamo y su responsable coincidan con la reserva. Las llaves foráneas por sí solas no verifican esa correspondencia.
4. Validar fechas, mantenimiento, préstamos abiertos y transiciones. En producción usar la hora del servidor.
5. Registrar historial en la misma transacción; no aceptar eventos arbitrarios del cliente.
6. Usar `search_path = ''` y referencias calificadas en funciones `SECURITY DEFINER`; revocar ejecución pública y otorgarla solo a `authenticated`.
7. Probar dos solicitudes simultáneas, roles separados y rollback ante fallo.

## Verificación pendiente

Aplicación limpia de migraciones, pruebas RLS con usuario A/B/administrador, concurrencia real, transiciones atómicas y pruebas de integración. Los tests JavaScript de la demo no sustituyen estas pruebas.

La demo utiliza nombres visibles para facilitar la presentación. En producción `user_id` proviene de Supabase Auth; no se reserva escribiendo libremente el nombre de otra persona.
