const fs = require('fs');
const path = require('path');

const IMPORT_RE = /<!--\s*@import\s+(\w+)\s*-->/g;

// Reemplaza los <!-- @import nombre --> de "content" usando el mapa de
// componentes ya resueltos. Lanza un error claro si el componente no existe.
function applyImports(content, resolvedComponents) {
  return content.replace(IMPORT_RE, (match, compName) => {
    if (!(compName in resolvedComponents)) {
      throw new Error(`Componente "${compName}" no encontrado`);
    }
    return resolvedComponents[compName];
  });
}

// Lee los archivos .html de la carpeta de componentes, sin resolver
// todavía sus posibles @import internos.
function loadRawComponents(config) {
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
      components[compName] = fs.readFileSync(compPath, 'utf8');
    }
  });

  return components;
}

// Resuelve recursivamente los @import dentro de los propios componentes,
// detectando importaciones circulares (A -> B -> A).
function resolveComponents(rawComponents) {
  const resolved = {};
  const inProgress = new Set();

  function resolve(name, chain) {
    if (name in resolved) return resolved[name];
    if (!(name in rawComponents)) {
      throw new Error(`Componente "${name}" no encontrado (importado desde ${chain.join(' -> ')})`);
    }
    if (inProgress.has(name)) {
      throw new Error(`Importación circular de componentes detectada: ${chain.join(' -> ')}`);
    }

    inProgress.add(name);
    resolved[name] = rawComponents[name].replace(IMPORT_RE, (match, childName) =>
      resolve(childName, [...chain, childName])
    );
    inProgress.delete(name);

    return resolved[name];
  }

  Object.keys(rawComponents).forEach(name => resolve(name, [name]));
  return resolved;
}

function loadComponents(config) {
  return resolveComponents(loadRawComponents(config));
}

module.exports = { loadComponents, loadRawComponents, resolveComponents, applyImports };
