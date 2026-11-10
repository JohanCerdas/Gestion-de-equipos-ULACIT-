# Plan a partir de la base v0.1.0

## Punto de partida

Ya existe una preview navegable con seis vistas, datos ficticios, operaciones locales, 14 pruebas unitarias, 4 pruebas E2E, scripts de calidad, workflows y esquema SQL inicial. Estos componentes son reutilizables; no se debe rehacer el diseño ni duplicar la estructura.

La aplicación todavía no tiene usuarios reales ni conexión operativa a Supabase. Cada módulo debe sustituir la demo por servicios reales conservando sus contratos y pruebas.

## Distribución propuesta del esfuerzo pendiente

Johan asume aproximadamente 40%; Liam, Fabricio y Jhon, 20% cada uno. Es una estimación de responsabilidad y complejidad para planificar, no una medición de horas ni de calificación.

| Integrante                             | Entregables y límites                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Johan Cerdas · PM e integración        | Arquitectura compartida; separación de módulos; creación de ambientes Supabase; revisión y aplicación de migraciones; RPC y seguridad transaccional; adaptador de datos; RLS; integración continua; despliegue; integración de módulos; pruebas de concurrencia y flujo completo; revisión del PR de entrega; consolidación de calidad. |
| Liam Carrillo · acceso y catálogo      | Inicio/cierre de sesión, manejo de sesión vencida y perfiles; formularios de alta/edición de equipos, filtros y mantenimiento; conexión de su módulo a los servicios de Johan; pruebas unitarias y E2E de acceso y catálogo; documentación. No permitir que la interfaz otorgue roles.                                                  |
| Fabricio Sánchez · PO y reservas       | Validar reglas; priorizar backlog con Johan; disponibilidad por intervalo, crear/modificar/cancelar reservas, mensajes de conflicto y estados vacíos; consumir las RPC de Johan; pruebas de límites, cancelación y edición; documentación de criterios.                                                                                 |
| Jhon Wright · préstamos y devoluciones | Pantallas de entrega, devolución y detalle del préstamo; historial con filtros; comprobación de condición y observaciones; consumir RPC de Johan; pruebas de duplicados, daños y estados; documentación de uso.                                                                                                                         |

Todos entregan implementación, casos de prueba, evidencias y documentación de su módulo. Johan no debe recibir funcionalidades sin pruebas para terminarlas por los demás.

## Paquetes de trabajo en orden

### Etapa 1: aprobar la base y acordar contratos

| ID     | Responsable       | Entrega verificable                                                           |
| ------ | ----------------- | ----------------------------------------------------------------------------- |
| TEC-01 | Johan             | Base integrada en develop para el trabajo directo del equipo.                 |
| TEC-02 | Johan             | Separar render y eventos por módulo; documentar interfaz del adaptador.       |
| PO-01  | Fabricio + equipo | Confirmar reglas pendientes en arquitectura.md, roles, estados y alcance.     |
| QA-01  | Todos             | Ejecutar localmente la demo y las pruebas; registrar problemas reproducibles. |

Todos continúan directamente en develop con la base integrada.

### Etapa 2: infraestructura y módulos en paralelo

| ID    | Responsable | Criterio de aceptación                                                                                                         |
| ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| BE-01 | Johan       | Migración aplicada en Supabase de desarrollo; perfiles con rol controlado; RLS probado con dos usuarios y un administrador.    |
| BE-02 | Johan       | RPC de reserva/edición/cancelación con restricciones y bloqueo; dos solicitudes simultáneas no generan traslape.               |
| BE-03 | Johan       | RPC de entrega/devolución e historial atómicos; rollback ante fallo; devolución duplicada rechazada.                           |
| BE-04 | Johan       | Adaptador real con errores normalizados y modo demo explícito; sin credenciales privadas en el frontend.                       |
| US-01 | Liam        | Sesión real inicia/cierra correctamente; sesión vencida vuelve al acceso; rutas protegidas y permisos verificados en servidor. |
| US-02 | Liam        | Administrador crea/edita equipos y mantenimiento; usuario consulta; validaciones y estados vacíos probados.                    |
| US-03 | Fabricio    | Disponibilidad por intervalo; reserva válida persistida en Supabase y conflicto presentado sin registros parciales.            |
| US-04 | Fabricio    | Modificación y cancelación respetan reglas; edición conserva la reserva anterior cuando falla.                                 |
| US-05 | Jhon        | Entrega vinculada a reserva válida y responsable; segundo préstamo activo del equipo es rechazado.                             |
| US-06 | Jhon        | Devolución cierra préstamo, actualiza equipo y registra historial; daño exige descripción.                                     |
| US-07 | Jhon        | Historial filtrable por equipo, fecha y acción, con los permisos definidos.                                                    |

Los integrantes pueden construir formularios y pruebas usando la demo mientras Johan prepara las RPC. La aceptación final requiere probar el servicio real: el éxito con localStorage no basta.

### Etapa 3: integración y entrega

| ID     | Responsable             | Criterio de aceptación                                                                                         |
| ------ | ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| INT-01 | Johan + todos           | Flujo acceso → catálogo → reserva → entrega → devolución → historial probado en desarrollo.                    |
| QA-02  | Cada dueño de módulo    | Casos positivos, negativos y límites; defectos corregidos y evidencias vinculadas a historias.                 |
| QA-03  | Johan                   | Matriz de trazabilidad y reporte de pruebas; revisión de riesgos pendientes.                                   |
| REL-01 | Johan; revisión de Liam | Migraciones probadas en ambiente final, PR develop → main aprobado, Pages publicado y prueba rápida posterior. |

## Archivos y coordinación

- Estilos base, enrutador, configuración, `src/services/`, `src/domain/`, migraciones y workflows: coordina Johan.
- `src/modules/auth/` y `src/modules/equipos/`: Liam.
- `src/modules/reservas/`: Fabricio.
- `src/modules/prestamos/`, `devoluciones/` e `historial/`: Jhon.
- Hasta extraer los módulos, evitar que todos editen `src/main.js`. Solicitar a Johan la integración de cada entrada.
- No modificar migraciones ya aplicadas; agregar una nueva con identificador único.

## Flujo de trabajo: solo develop y main

- Todos trabajan directamente en `develop`. Antes de empezar: `git switch develop` y `git pull --rebase origin develop`.
- Después de probar sus cambios: `git add .`, `git commit -m "feat: describir cambio"` y `git push origin develop`.
- Si otro compañero publicó cambios, ejecutar `git pull --rebase origin develop`, resolver conflictos y volver a probar antes de subir.
- No se crean ramas individuales ni se requieren PR hacia develop.
- Para entregar una versión se abre un PR de `develop` hacia `main`. Johan revisa los cambios y puede integrarlos sin aprobación ajena.
- Las pruebas automáticas informan los resultados; no son un bloqueo obligatorio configurado en GitHub.
- La publicación corresponde a main. El equipo debe revisar y probar antes de integrar.
- Al integrar develop en main, usar **Create a merge commit** para conservar el historial compartido entre las dos ramas.
