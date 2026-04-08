import { EventEmitter } from 'node:events';

// EventEmitter unico para toda la app.
// Lo importan tanto los controllers (para emitir) como
// los listeners (para suscribirse).
const ee = new EventEmitter({ captureRejections: true });

// si algun handler async revienta, al menos que no tire la app
ee.on('error', (err) => {
  console.error('[eventBus] handler fallo:', err.message);
});

export default ee;
