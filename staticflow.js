#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const http = require('http');
const { performance } = require('perf_hooks');

// Configuración predeterminada
const config = {
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

// Procesar argumentos de línea de comandos
process.argv.forEach(arg => {
  if (arg.startsWith('--port=')) config.port = parseInt(arg.split('=')[1]);
  if (arg === '--watch') config.watch = true;
  if (arg === '--quiet') config.verbose = false;
  if (arg === '--minify') config.minify = true;
});

// 1. Técnica: Minificación de HTML (sin dependencias)
function minifyHTML(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '') // Eliminar comentarios
    .replace(/\s+/g, ' ')             // Reemplazar múltiples espacios por uno
    .replace(/>\s+</g, '><')          // Eliminar espacios entre etiquetas
    .replace(/\s+>/g, '>')            // Eliminar espacios antes de >
    .replace(/>\s+/g, '>')            // Eliminar espacios después de >
    .replace(/<\s+/g, '<')            // Eliminar espacios después de <
    .trim();
}

// 2. Técnica: Minificación de CSS (sin dependencias)
function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Eliminar comentarios
    .replace(/\s+/g, ' ')              // Reemplazar múltiples espacios por uno
    .replace(/\s*([{:;,])\s*/g, '$1')  // Eliminar espacios alrededor de ciertos caracteres
    .replace(/;}/g, '}')               // Eliminar punto y coma antes de }
    .replace(/\s+!important/g, '!important') // Manejar !important
    .trim();
}

// 3. Técnica: Minificación de JS (sin dependencias)
function minifyJS(js) {
  return js
    .replace(/\/\/[^\n]*/g, '')       // Eliminar comentarios de línea
    .replace(/\/\*[\s\S]*?\*\//g, '') // Eliminar comentarios de bloque
    .replace(/\s+/g, ' ')              // Reemplazar múltiples espacios por uno
    .replace(/\s*([=+\-*/%&|^!<>?:{}()[\],;])\s*/g, '$1') // Eliminar espacios alrededor de operadores
    .replace(/\s*\n\s*/g, ';')        // Reemplazar saltos de línea por punto y coma
    .replace(/;{2,}/g, ';')           // Eliminar puntos y coma duplicados
    .replace(/;}/g, '}')               // Eliminar punto y coma antes de llaves
    .trim();
}

// Cargar componentes
function loadComponents() {
  const components = {};
  const compDir = path.join(config.root, config.components);
  
  if (!fs.existsSync(compDir)) {
    console.error(`❌ Carpeta de componentes no encontrada: ${compDir}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(compDir);
  
  files.forEach(file => {
    if (path.extname(file) === '.html') {
      const compPath = path.join(compDir, file);
      const compName = path.basename(file, '.html');
      let content = fs.readFileSync(compPath, 'utf8');
      
      // Minificar componentes si está activado
      if (config.minify) {
        content = minifyHTML(content);
      }
      
      components[compName] = content;
    }
  });
  
  return components;
}

// Función para calcular profundidad de directorio
function calculateRelativeDepth(filePath) {
  const pagesDir = path.join(config.root, config.pages);
  const relativePath = path.relative(pagesDir, filePath);
  
  // Contar niveles de directorio (sin incluir el archivo)
  if (relativePath === path.basename(relativePath)) {
    return 0; // Está en la raíz de pages
  }
  
  const dirs = path.dirname(relativePath).split(path.sep);
  return dirs.length;
}

// Compilar una página (con minificación opcional)
function compilePage(filePath, components) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Reemplazar componentes: <!-- @import header -->
  content = content.replace(/<!--\s*@import\s+(\w+)\s*-->/g, (match, compName) => {
    return components[compName] || `<!-- Componente "${compName}" no encontrado -->`;
  });
  
  // Calcular profundidad correctamente
  const depth = calculateRelativeDepth(filePath);
  
  // Generar prefijo de ruta correcto
  const basePath = depth > 0 ? '../'.repeat(depth) : './';
  
  // Reemplazar rutas absolutas por relativas
  content = content.replace(/(href|src)="\/([^"]*)"/g, (match, attr, value) => {
    if (value.startsWith('http') || value.startsWith('#')) return match;
    return `${attr}="${basePath}${value}"`;
  });
  
  // Minificar HTML si está activado
  if (config.minify) {
    content = minifyHTML(content);
  }
  
  return content;
}

// Copiar y minificar archivos estáticos
function copyStaticFiles(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyStaticFiles(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, 'utf8');
      const ext = path.extname(srcPath);
      
      // Minificar según el tipo de archivo
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

// Construir todo el sitio
function buildSite() {
  const start = performance.now();
  const components = loadComponents();
  const pagesDir = path.join(config.root, config.pages);
  const outputDir = path.join(config.root, config.output);
  
  // Limpiar directorio de salida
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });
  
  // Copiar assets
  const assetsDir = path.join(config.root, config.assets);
  if (fs.existsSync(assetsDir)) {
    const destAssets = path.join(outputDir, config.assets);
    if (!fs.existsSync(destAssets)) {
      fs.mkdirSync(destAssets, { recursive: true });
    }
    copyStaticFiles(assetsDir, destAssets);
  }
  
  // Procesar páginas
  function processPages(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Crear directorio equivalente en output
        const relativeDir = path.relative(pagesDir, fullPath);
        const outputPath = path.join(outputDir, relativeDir);
        if (!fs.existsSync(outputPath)) {
          fs.mkdirSync(outputPath, { recursive: true });
        }
        processPages(fullPath);
      } else if (path.extname(entry.name) === '.html') {
        const compiled = compilePage(fullPath, components);
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

// Servidor de desarrollo con recarga automática
function startDevServer() {
  const server = http.createServer((req, res) => {
    let filePath = path.join(config.root, config.output, req.url);
    
    // Si es un directorio, buscar index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    
    // Si no tiene extensión, asumir HTML
    if (!path.extname(filePath)) filePath += '.html';
    
    // Servir archivo
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).substring(1);
      const contentType = {
        'html': 'text/html',
        'css': 'text/css',
        'js': 'text/javascript',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'svg': 'image/svg+xml',
        'ico': 'image/x-icon',
        'json': 'application/json',
        'woff': 'font/woff',
        'woff2': 'font/woff2'
      }[ext] || 'text/plain';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(fs.readFileSync(filePath));
    } else {
      res.writeHead(404);
      res.end('404 - No encontrado');
    }
  });
  
  server.listen(config.port, () => {
    console.log(`🌐 Servidor ejecutándose en http://localhost:${config.port}`);
    console.log('📡 Esperando cambios... (Ctrl+C para salir)');
  });
  
  return server;
}

// Sistema de observación de cambios mejorado
function setupWatcher() {
  const watchedPaths = [
    path.join(config.root, config.components),
    path.join(config.root, config.pages),
    path.join(config.root, config.assets),
    config.root
  ];
  
  const watchers = watchedPaths.map(watchPath => {
    return fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
      if (filename && !filename.startsWith('.') && 
          !filename.includes('~') && 
          path.extname(filename) !== '.tmp') {
        console.log(`\n🔄 Cambio detectado: ${filename}`);
        buildSite();
      }
    });
  });
  
  return watchers;
}

// Punto de entrada principal
function main() {
  try {
    buildSite();
    
    if (config.watch) {
      const server = startDevServer();
      const watchers = setupWatcher();
      
      // Manejar cierre
      process.on('SIGINT', () => {
        console.log('\n🔌 Apagando servidor...');
        watchers.forEach(watcher => watcher.close());
        server.close();
        process.exit();
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar
main();
