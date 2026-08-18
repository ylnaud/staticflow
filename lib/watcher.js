const fs = require('fs');
const path = require('path');

// Observa las carpetas de origen (componentes, páginas, assets) y llama a
// onChange() cuando detecta un cambio relevante.
//
// Nota: config.output ("public/" por defecto) se excluye a propósito:
// buildSite() borra y regenera esa carpeta en cada build, así que
// observarla provocaría reconstrucciones redundantes o en bucle.
function setupWatcher(config, onChange) {
  const watchedPaths = [
    path.join(config.root, config.components),
    path.join(config.root, config.pages),
    path.join(config.root, config.assets)
  ];

  return watchedPaths
    .filter(watchPath => fs.existsSync(watchPath))
    .map(watchPath =>
      fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
        if (
          filename &&
          !filename.startsWith('.') &&
          !filename.includes('~') &&
          path.extname(filename) !== '.tmp'
        ) {
          console.log(`\n🔄 Cambio detectado: ${filename}`);
          onChange();
        }
      })
    );
}

module.exports = { setupWatcher };
