import { createServer } from 'node:http';
import mongoose from 'mongoose';
import app from './app.js';
import dbConnect from './config/db.js';

const PORT = process.env.PORT || 3000;

await dbConnect();

const httpServer = createServer(app);

const server = httpServer.listen(PORT, () => {
  console.log(`[server] API escuchando en http://localhost:${PORT}`);
});

// cierre ordenado al recibir SIGTERM/SIGINT
const shutdown = (signal) => {
  console.log(`${signal} recibido, cerrando servidor...`);

  server.close(async () => {
    console.log('Servidor HTTP cerrado');
    await mongoose.connection.close();
    console.log('MongoDB desconectado');
    process.exit(0);
  });

  // si se cuelga, forzar a los 10s
  setTimeout(() => {
    console.error('Forzando cierre');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
