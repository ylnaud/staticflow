const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const { loadComponents } = require('./components');
const { compilePage } = require('./compiler');
const { minifyCSS } = require('./minify/css');
const { minifyJS } = require('./minify/js');
const { minifyHTML } = require('./minify/html');

// Copia (y opcionalmente minifica) archivos estáticos de "src" a "dest".
function copyStaticFiles(config, src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyStaticFiles(config, srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, 'utf8');
      const ext = path.extname(srcPath);

      if (config.minify) {
        if (ext === '.css') {
          content = minifyCSS(content);
        } else if (ext === '.js') {
          content = minifyJS(content);
        } else if (ext === '.html') {
          content = minifyHTML(content);
        }
      }

      fs.writeFileSync(destPath, content);
      if (config.verbose) {
        const action = config.minify ? 'Minificado y copiado' : 'Copiado';
        console.log(`📦 ${action}: ${path.relative(config.root, srcPath)}`);
      }
    }
  }
}

// Construye el sitio completo: limpia la salida, copia assets y compila páginas.
function buildSite(config) {
  const start = performance.now();
  const components = loadComponents(config);
  const pagesDir = path.join(config.root, config.pages);
  const outputDir = path.join(config.root, config.output);

  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  const assetsDir = path.join(config.root, config.assets);
  if (fs.existsSync(assetsDir)) {
    const destAssets = path.join(outputDir, config.assets);
    if (!fs.existsSync(destAssets)) {
      fs.mkdirSync(destAssets, { recursive: true });
    }
    copyStaticFiles(config, assetsDir, destAssets);
  }

  function processPages(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        const relativeDir = path.relative(pagesDir, fullPath);
        const outputPath = path.join(outputDir, relativeDir);
        if (!fs.existsSync(outputPath)) {
          fs.mkdirSync(outputPath, { recursive: true });
        }
        processPages(fullPath);
      } else if (path.extname(entry.name) === '.html') {
        const compiled = compilePage(config, fullPath, components);
        const relativePath = path.relative(pagesDir, fullPath);
        const outputPath = path.join(outputDir, relativePath);

        fs.writeFileSync(outputPath, compiled);
        if (config.verbose) {
          const action = config.minify ? 'Minificado y creado' : 'Creado';
          console.log(`✅ ${action}: ${relativePath}`);
        }
      }
    }
  }

  processPages(pagesDir);

  const duration = Math.round(performance.now() - start);
  console.log(`🚀 Sitio construido en ${duration}ms en: ${outputDir}`);
  if (config.minify) console.log('🔧 Minificación activada');
}

module.exports = { copyStaticFiles, buildSite };
