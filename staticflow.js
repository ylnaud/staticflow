#!/usr/bin/env node
const { parseArgs } = require('./lib/config');
const { buildSite } = require('./lib/build');
const { startDevServer } = require('./lib/server');
const { setupWatcher } = require('./lib/watcher');

const config = parseArgs(process.argv);

function main() {
  try {
    buildSite(config);

    if (config.watch) {
      const server = startDevServer(config);
      const watchers = setupWatcher(config, () => {
        try {
          buildSite(config);
        } catch (error) {
          // No salir del proceso: un error durante el watch no debe
          // tumbar el servidor de desarrollo, solo reportarse.
          console.error('❌ Error al reconstruir:', error.message);
        }
      });

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

main();
