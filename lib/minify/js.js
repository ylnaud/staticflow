// NOTA: minificador basado en expresiones regulares (sin dependencias externas).
// No es un parser real: puede producir salidas incorrectas con literales de
// plantilla (`` ` ``), literales de expresión regular que contienen "//", o
// cadenas de texto que contienen los caracteres usados como separadores.
// Úsalo solo para JS simple; si tu código es complejo, considera no
// minificarlo o hacerlo con otra herramienta fuera de este framework.
function minifyJS(js) {
  return js
    .replace(/\/\/[^\n]*/g, '')       // Eliminar comentarios de línea
    .replace(/\/\*[\s\S]*?\*\//g, '') // Eliminar comentarios de bloque
    .replace(/\s+/g, ' ')              // Reemplazar múltiples espacios por uno
    .trim();
}

module.exports = { minifyJS };
