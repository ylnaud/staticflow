const fs = require('fs');
const path = require('path');

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

// Carga staticflow.config.js si existe, y lo mergea sobre el config por defecto.
// Precedencia: defaultConfig < staticflow.config.js < args de CLI.
function loadFileConfig(root) {
  const configPath = path.join(root, 'staticflow.config.js');
  if (!fs.existsSync(configPath)) return {};
  try {
    return require(configPath);
  } catch (e) {
    console.warn(`⚠️  Error al cargar staticflow.config.js: ${e.message}`);
    return {};
  }
}

function parseArgs(argv) {
  const config = defaultConfig();
  const fileConfig = loadFileConfig(config.root);
  Object.assign(config, fileConfig);

  argv.forEach(arg => {
    if (arg.startsWith('--port=')) config.port = parseInt(arg.split('=')[1], 10);
    if (arg === '--watch') config.watch = true;
    if (arg === '--quiet') config.verbose = false;
    if (arg === '--minify') config.minify = true;
  });

  return config;
}

module.exports = { defaultConfig, parseArgs };
