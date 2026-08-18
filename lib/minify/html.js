// Minificación de HTML basada en expresiones regulares (sin dependencias).
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

module.exports = { minifyHTML };
