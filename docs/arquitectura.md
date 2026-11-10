# Arquitectura y contratos de la base

## Implementado

Aplicación Vite con HTML, CSS y JavaScript, sin framework de interfaz. `main.js` compone seis vistas y administra los eventos. `src/domain/operations.js` contiene funciones puras de transición. `src/services/demo-store.js` guarda la demostración en localStorage. `src/shared/ui.js` centraliza formato y escape de texto.

Rutas con hash para que GitHub Pages pueda servir enlaces internos sin un servidor de rutas. Datos de prueba relativos al día de la primera apertura; pueden reiniciarse en Configuración. Fuentes Google Fonts con respaldo sans-serif. Ilustraciones SVG y CSS locales, sin fotografías externas.

## Contrato de transición

Las funciones reciben el estado y devuelven un nuevo estado; ante un error lanzan `DomainError` y no mutan el original. La interfaz persiste solo después del éxito.

| Operación           | Entrada                                 | Regla principal                                   |
| ------------------- | --------------------------------------- | ------------------------------------------------- |
| `createReservation` | equipo, persona, propósito, inicio, fin | Fechas futuras, sin traslapes y equipo operativo  |
| `cancelReservation` | ID de reserva                           | Solo activa                                       |
| `checkout`          | ID de reserva                           | Activa, dentro del intervalo, equipo sin préstamo |
| `returnEquipment`   | ID de préstamo, condición y notas       | Solo activo; daños requieren descripción          |

## Frontera de la demostración

No hay autenticación real, autorización de servidor, sincronización entre dispositivos ni garantías de concurrencia en localStorage. La vista está identificada como demostración. La edición de equipos y de reservas corresponde a las siguientes historias.

El cliente Supabase está preparado en `src/services/supabase-client.js`, pero no está conectado a la interfaz. No basta con agregar variables para cambiar a producción: Johan debe implementar el adaptador de datos y las RPC, y Liam la sesión real. Mantener un modo de demostración explícito para las pruebas.

## Reglas propuestas por validar

- Permitir entrega solo dentro del intervalo reservado.
- Bloquear nuevas reservas de un equipo mientras haya un préstamo activo, aun si el horario solicitado es futuro. Es una decisión conservadora de esta demo; confirmar si el producto debe permitir reservas futuras según fecha de devolución prevista.
- Un equipo dañado vuelve a mantenimiento, nunca a disponible.
- Definir el tratamiento de reservas vencidas y cancelación/modificación cerca del inicio antes de integrar producción.

## Separación siguiente

Extraer vistas y eventos de `main.js` a `src/modules/auth`, `equipos`, `reservas`, `prestamos`, `devoluciones` e `historial`. Cada integrante trabaja en su carpeta y pide a Johan integrar la navegación compartida. Evitar PR simultáneos sobre el mismo archivo principal.
