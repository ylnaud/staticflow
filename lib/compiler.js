const fs = require('fs');
const path = require('path');
const { applyImports } = require('./components');
const { minifyHTML } = require('./minify/html');

// Calcula cuántos niveles de directorio hay entre "pages/" y el archivo dado,
// para poder generar rutas relativas correctas en la página compilada.
function calculateRelativeDepth(config, filePath) {
  const pagesDir = path.join(config.root, config.pages);
  const relativePath = path.relative(pagesDir, filePath);

  if (relativePath === path.basename(relativePath)) {
    return 0; // Está en la raíz de pages
  }

  const dirs = path.dirname(relativePath).split(path.sep);
  return dirs.length;
}

// Compila una página: resuelve sus @import, reescribe rutas absolutas a
// relativas y minifica si corresponde.
function compilePage(config, filePath, components) {
  let content = fs.readFileSync(filePath, 'utf8');

  content = applyImports(content, components);

  const depth = calculateRelativeDepth(config, filePath);
  const basePath = depth > 0 ? '../'.repeat(depth) : './';

  content = content.replace(/(href|src)="\/([^"]*)"/g, (match, attr, value) => {
    if (value.startsWith('http') || value.startsWith('#')) return match;
    return `${attr}="${basePath}${value}"`;
  });

  if (config.minify) {
    content = minifyHTML(content);
  }

  return content;
}

module.exports = { calculateRelativeDepth, compilePage };
