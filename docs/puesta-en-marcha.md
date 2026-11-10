# Puesta en marcha

Ejecutar `npm ci` y `npm run dev` en VS Code. La aplicación utiliza datos ficticios locales.

## Flujo de trabajo: solo develop y main

- Todos trabajan directamente en `develop`. Antes de empezar: `git switch develop` y `git pull --rebase origin develop`.
- Después de probar sus cambios: `git add .`, `git commit -m "feat: describir cambio"` y `git push origin develop`.
- Si otro compañero publicó cambios, ejecutar `git pull --rebase origin develop`, resolver conflictos y volver a probar antes de subir.
- No se crean ramas individuales ni se requieren PR hacia develop.
- Para entregar una versión se abre un PR de `develop` hacia `main`. Johan revisa los cambios y puede integrarlos sin aprobación ajena.
- Las pruebas automáticas informan los resultados; no son un bloqueo obligatorio configurado en GitHub.
- La publicación corresponde a main. El equipo debe revisar y probar antes de integrar.
- Al integrar develop en main, usar **Create a merge commit** para conservar el historial compartido entre las dos ramas.

## GitHub Pages y Supabase

Habilitar Pages con GitHub Actions cuando corresponda publicar. Completar el adaptador Supabase y las RPC antes de usar datos reales. La migración inicial está propuesta y pendiente de pruebas en desarrollo.
