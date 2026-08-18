# StaticFlow

![Node](https://img.shields.io/badge/node-%3E%3D22.15.0-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![Dependencies](https://img.shields.io/badge/dependencies-0-success) ![Template](https://img.shields.io/badge/GitHub-Template-8250df)

Generador de sitios estáticos sin dependencias externas. Solo Node.js. Zero config.

**Demo en producción:** [staticflow-ten.vercel.app](https://staticflow-ten.vercel.app/)

---

## ¿Qué es StaticFlow?

StaticFlow compila páginas HTML con componentes reutilizables y genera un sitio listo para subir a cualquier hosting estático. Sin npm install, sin bundlers, sin frameworks — solo Node.js core.

---

## Características

- **Cero dependencias** — `package.json` sin ningún paquete en `dependencies` ni `devDependencies`
- **Componentes HTML** — reutilizá fragmentos con `<!-- @import nombre -->`
- **Imports anidados** — los componentes pueden importar otros componentes
- **Detección de ciclos** — importación circular = error claro, no bucle infinito
- **Minificación** — HTML, CSS y JS minificados en el build de producción
- **Servidor de desarrollo** — livereload al guardar cualquier archivo fuente
- **Config file** — `staticflow.config.js` para configurar sin tocar el CLI
- **Rutas automáticas** — convierte rutas absolutas a relativas según profundidad de página
- **Modular** — motor dividido en `lib/` con funciones puras y sin estado global

---

## Estructura del proyecto

```
staticflow/
├── _components/          # fragmentos HTML reutilizables
│   ├── header.html
│   └── footer.html
├── pages/                # páginas fuente → compilan a public/
│   ├── index.html
│   ├── about.html
│   ├── 404.html
│   └── blog/
│       └── index.html
├── assets/               # CSS, JS, imágenes → se copian a public/assets/
│   ├── css/styles.css
│   └── js/main.js
├── public/               # salida del build (no versionar)
├── lib/                  # módulos internos del motor
│   ├── config.js         # parseArgs + loadFileConfig
│   ├── build.js          # buildSite, copyStaticFiles
│   ├── compiler.js       # compilePage, calculateRelativeDepth
│   ├── components.js     # loadComponents, resolveComponents, applyImports
│   ├── server.js         # startDevServer
│   ├── watcher.js        # setupWatcher
│   └── minify/
│       ├── html.js
│       ├── css.js
│       └── js.js
├── staticflow.js         # entrypoint delgado
├── staticflow.config.js  # config del proyecto (opcional)
├── vercel.json
└── package.json
```

---

## Instalación y primeros pasos

Requisito: **Node.js ≥ 22.15.0**. No hay `npm install`.

```bash
# Opción 1: usar como plantilla en GitHub (recomendado)
# Hacer clic en "Use this template" en github.com/ylnaud/staticflow

# Opción 2: clonar directamente
git clone https://github.com/ylnaud/staticflow mi-sitio
cd mi-sitio

# Iniciar servidor de desarrollo
npm start

# Build de producción
npm run build
```

---

## Comandos

| Comando | Descripción |
|---|---|
| `npm start` | Build + servidor en `localhost:3000` + watch de cambios |
| `npm run build` | Build de producción con minificación, genera `public/` |
| `node staticflow.js --port=8080` | Cambiar el puerto del servidor |
| `node staticflow.js --quiet` | Suprimir mensajes de consola |
| `node staticflow.js --minify` | Activar minificación explícitamente |

---

## Componentes

Creá cualquier archivo `.html` en `_components/` e importalo desde tus páginas:

```html
<!-- pages/index.html -->
<!DOCTYPE html>
<html lang="es">
<body>
  <!-- @import header -->

  <main>
    <h1>Hola mundo</h1>
  </main>

  <!-- @import footer -->
</body>
</html>
```

### Imports anidados

Los componentes pueden importar otros componentes:

```html
<!-- _components/header.html -->
<header>
  <!-- @import logo -->
  <nav>...</nav>
</header>
```

StaticFlow resuelve los imports recursivamente con memoización.

### Ciclos y componentes inexistentes

- **Ciclo** (A → B → A): el build falla con `❌ Error: Importación circular detectada: header → logo → header`
- **Componente inexistente**: el build falla con `❌ Error: Componente "navbar" no encontrado`

Ambos son errores fatales con exit code 1. No hay plantillas silenciosas.

---

## Config file

Creá `staticflow.config.js` en la raíz para configurar el motor:

```js
// staticflow.config.js
module.exports = {
  port:    3000,
  verbose: true,
  minify:  false,

  // avanzado (raramente necesario cambiar)
  components: '_components',
  pages:      'pages',
  output:     'public',
  assets:     'assets',
};
```

**Precedencia:** defaults ← `staticflow.config.js` ← args de CLI

| Opción | Tipo | Default | Descripción |
|---|---|---|---|
| `port` | number | `3000` | Puerto del servidor de desarrollo |
| `verbose` | boolean | `true` | Mostrar mensajes en consola |
| `minify` | boolean | `false` | Minificar HTML, CSS y JS |
| `components` | string | `'_components'` | Carpeta de componentes |
| `pages` | string | `'pages'` | Carpeta de páginas fuente |
| `output` | string | `'public'` | Carpeta de salida del build |
| `assets` | string | `'assets'` | Carpeta de assets estáticos |

---

## Despliegue en Vercel

El repo incluye `vercel.json` preconfigurado:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "public",
  "installCommand": "npm install",
  "framework": null
}
```

**Pasos:**
1. Importá el repo desde [vercel.com/new](https://vercel.com/new)
2. Vercel detecta la config automáticamente
3. Cada push a `main` dispara un redeploy

### Netlify

- Build command: `npm run build`
- Publish directory: `public`
- Node version: `NODE_VERSION=22`

---

## Limitaciones conocidas

- Las rutas dentro de CSS (`url()`, `@import` de CSS) no se reescriben — usá rutas relativas en tus archivos CSS
- El minificador de JS es basado en regex, no en un parser AST real. Puede fallar con template literals o regex literales con `//`
- No hay soporte para preprocesadores (Sass, TypeScript, PostCSS, etc.)
- No hay sistema de variables ni datos dinámicos — todo es HTML puro
- El watcher usa `fs.watch` nativo, que en algunos sistemas Linux puede requerir ajustar `inotify`

---

## Contribuir

1. Forkear el repo
2. Crear una rama: `git checkout -b feature/mi-mejora`
3. Commitear los cambios con mensajes descriptivos
4. Abrir un Pull Request

No hay suite de tests formal — verificar manualmente con `npm run build` y `npm start`.

---

## Licencia

[MIT](LICENSE) — Hecho por [Duanly Vega Alderete](https://github.com/ylnaud)
