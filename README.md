# StaticFlow Framework :es:

Framework estático para crear sitios web rápidos sin dependencias externas.

## Características Principales

- ⚡️ **Ultra rápido** - Compilación en milisegundos
- ♻️ **Componentes reutilizables** - Sistema simple de importación
- 🛠️ **Minificación integrada** - Reduce el tamaño de tus archivos
- 🔄 **Recarga automática** - Modo desarrollo con `--watch`

## Requisitos

- Node.js v22.15.0 o superior

## Comenzar
mi-sitio/
├── _components/   # Componentes HTML
├── pages/         # Páginas principales
├── assets/        # CSS, JS, imágenes
├── staticflow.js  # Punto de entrada (CLI)
└── lib/           # Motor del framework (config, minificadores, componentes, build, server, watcher)

Comandos Disponibles
Comando	Descripción
./staticflow.js	Compilar sitio (producción)
./staticflow.js --watch	Modo desarrollo con recarga
./staticflow.js --minify	Minificar HTML, CSS y JS
./staticflow.js --port=80	Cambiar puerto del servidor
./staticflow.js --quiet	Modo silencioso (menos mensajes)

Personalización

Edita lib/config.js para cambiar la configuración por defecto:
javascript

function defaultConfig() {
  return {
    components: '_components',  // Carpeta de componentes
    pages: 'pages',              // Carpeta de páginas
    assets: 'assets',            // Carpeta de recursos
    output: 'public',            // Carpeta de salida
    port: 3000,                  // Puerto de desarrollo
    // ... otras opciones
  };
}

Preguntas Frecuentes
¿Cómo añado un nuevo componente?

    Crea un archivo .html en _components/

    Usalo en tus páginas (o en otro componente) con <!-- @import nombre-componente -->

    Los componentes pueden importar otros componentes (imports anidados). Si se detecta un ciclo de imports (A importa B, B importa A), el build falla con un error claro en vez de colgarse.

    Si un @import referencia un componente que no existe, el build falla (exit code distinto de cero) en vez de insertar un comentario placeholder silencioso — así un sitio roto nunca se "construye con éxito" por error.

¿Dónde pongo mis archivos CSS?

    Crea una carpeta assets/css/

    Coloca tus archivos CSS allí

    Referéncialos con: <link rel="stylesheet" href="/assets/css/tu-archivo.css">

    Nota: las rutas absolutas (href="/...", src="/...") solo se reescriben a relativas dentro de archivos HTML. Las referencias absolutas dentro de CSS (url(...), @import de CSS) no se reescriben — usa rutas relativas o ya correctas para tu ruta de despliegue.

¿Cómo publico mi sitio?

    Ejecuta ./staticflow.js --minify (o npm run build)

    Sube la carpeta public/ a tu hosting, o despliega el repo directamente en Vercel (ver siguiente sección)

## Despliegue en Vercel

El repositorio ya incluye un `vercel.json` con la configuración necesaria (`npm run build` como build command, `public/` como carpeta de salida). Para desplegar:

1. Importa el repositorio desde el [dashboard de Vercel](https://vercel.com/new).
2. Vercel detecta automáticamente el build command y la carpeta de salida gracias a `vercel.json` — no hace falta configurar nada manualmente.
3. La versión de Node.js requerida (`>=22.15.0`) se toma del campo `engines` en `package.json`.

La carpeta `public/` no está versionada en git (ver `.gitignore`); se regenera automáticamente en cada build, tanto localmente como en Vercel.

Contribuir

¿Encontraste un error? ¡Abre un issue o envía un pull request!
Licencia

MIT License - Libre para uso personal y comercial
