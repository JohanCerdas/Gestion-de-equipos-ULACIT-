# Puesta en marcha

## Local

1. Abrir esta carpeta en VS Code.
2. Ejecutar `npm ci`, luego `npm run dev`.
3. Abrir la URL que muestra Vite. El navegador conserva datos de prueba; Configuración permite reiniciarlos.
4. Para pruebas E2E instalar el navegador una vez: `npx playwright install chromium`.

## GitHub: acciones pendientes de acceso autenticado

Los archivos de automatización ya están preparados. Publicar la rama de base y develop, abrir PR de la primera hacia develop y pedir revisión de Liam. No integrar automáticamente ni saltar la revisión porque Johan sea el autor.

```bash
git push -u origin develop
git push -u origin feature/TEC-01-base-aplicacion
```

Después de publicar, abrir un PR con base `develop` y comparación `feature/TEC-01-base-aplicacion`.

## Protección de ramas

Para `main` y `develop`: exigir PR, al menos una aprobación, resolver conversaciones, descartar aprobaciones obsoletas y exigir el check `quality` cuando aparezca tras el primer workflow. Bloquear force push y eliminación. Mantener squash merge.

CODEOWNERS propone a Johan como revisor. No exigir aprobación exclusiva de ese único code owner para sus propios PR: necesita que otro integrante pueda aprobarlos. Añadir los usuarios GitHub de los compañeros cuando se conozcan.

## GitHub Pages

Settings → Pages → Source: GitHub Actions. El workflow se ejecuta con cambios aprobados en main. No publica ramas feature ni develop. Vite usa automáticamente el prefijo del repositorio durante ese build.

La versión actual publica una demo local por navegador. Antes de publicar producción, completar Supabase y configurar las variables públicas del build; nunca usar `service_role` en variables VITE.

## Supabase

Crear proyectos separados para desarrollo/pruebas y demostración final. Revisar y ejecutar las migraciones primero en desarrollo. Completar los tests de permisos y las RPC pendientes. Copiar `.env.example` a `.env.local` y configurar solo URL y clave pública cuando el adaptador real esté implementado.

## Validación registrada de la base

Consultar el resultado de `npm run check` y `npm run test:e2e` en el entorno propio. Los checks locales no prueban la configuración remota de GitHub ni el SQL en Supabase.
