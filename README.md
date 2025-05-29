# StaticFlow Framework :es:

Framework estático para crear sitios web rápidos sin dependencias externas.

## Características Principales

- ⚡️ **Ultra rápido** - Compilación en milisegundos
- ♻️ **Componentes reutilizables** - Sistema simple de importación
- 🛠️ **Minificación integrada** - Reduce el tamaño de tus archivos
- 🔄 **Recarga automática** - Modo desarrollo con `--watch`

## Requisitos

- Node.js v22.15.0 < superior

## Comenzar
mi-sitio/
├── _components/   # Componentes HTML
├── pages/         # Páginas principales
├── assets/        # CSS, JS, imágenes
└── staticflow.js  # Motor del framework

Comandos Disponibles
Comando	Descripción
./staticflow.js	Compilar sitio (producción)
./staticflow.js --watch	Modo desarrollo con recarga
./staticflow.js --minify	Minificar HTML, CSS y JS
./staticflow.js --port=80	Cambiar puerto del servidor
./staticflow.js --quiet	Modo silencioso (menos mensajes)

Personalización

Edita staticflow.js para cambiar configuraciones:
javascript

const config = {
  components: '_components',  // Carpeta de componentes
  pages: 'pages',             // Carpeta de páginas
  assets: 'assets',           // Carpeta de recursos
  output: 'public',           // Carpeta de salida
  port: 3000,                 // Puerto de desarrollo
  // ... otras opciones
};

Preguntas Frecuentes
¿Cómo añado un nuevo componente?

    Crea un archivo .html en _components/

    Usalo en tus páginas con <!-- @import nombre-componente -->

¿Dónde pongo mis archivos CSS?

    Crea una carpeta assets/css/

    Coloca tus archivos CSS allí

    Referéncialos con: <link rel="stylesheet" href="/assets/css/tu-archivo.css">

¿Cómo publico mi sitio?

    Ejecuta ./staticflow.js --minify

    Sube la carpeta public/ a tu hosting

Contribuir

¿Encontraste un error? ¡Abre un issue o envía un pull request!
Licencia

MIT License - Libre para uso personal y comercial
