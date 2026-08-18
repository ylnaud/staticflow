// Minificación de CSS basada en expresiones regulares (sin dependencias).
function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Eliminar comentarios
    .replace(/\s+/g, ' ')              // Reemplazar múltiples espacios por uno
    .replace(/\s*([{:;,])\s*/g, '$1')  // Eliminar espacios alrededor de ciertos caracteres
    .replace(/;}/g, '}')               // Eliminar punto y coma antes de }
    .replace(/\s+!important/g, '!important') // Manejar !important
    .trim();
}

module.exports = { minifyCSS };
