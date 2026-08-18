const fs = require('fs');
const path = require('path');
const http = require('http');

const CONTENT_TYPES = {
  html: 'text/html',
  css: 'text/css',
  js: 'text/javascript',
  png: 'image/png',
  jpg: 'image/jpeg',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  json: 'application/json',
  woff: 'font/woff',
  woff2: 'font/woff2'
};

// Servidor de desarrollo simple que sirve el contenido de config.output.
function startDevServer(config) {
  const server = http.createServer((req, res) => {
    let filePath = path.join(config.root, config.output, req.url);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!path.extname(filePath)) filePath += '.html';

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).substring(1);
      const contentType = CONTENT_TYPES[ext] || 'text/plain';

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

module.exports = { startDevServer };
