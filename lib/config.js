// Configuración y parseo de argumentos de línea de comandos.

function defaultConfig() {
  return {
    root: process.cwd(),
    components: '_components',
    pages: 'pages',
    assets: 'assets',
    output: 'public',
    port: 3000,
    watch: false,
    verbose: true,
    minify: false
  };
}

function parseArgs(argv) {
  const config = defaultConfig();

  argv.forEach(arg => {
    if (arg.startsWith('--port=')) config.port = parseInt(arg.split('=')[1], 10);
    if (arg === '--watch') config.watch = true;
    if (arg === '--quiet') config.verbose = false;
    if (arg === '--minify') config.minify = true;
  });

  return config;
}

module.exports = { defaultConfig, parseArgs };
