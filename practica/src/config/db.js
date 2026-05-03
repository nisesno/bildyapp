import mongoose from 'mongoose';

const dbConnect = async () => {
  const uri = process.env.DB_URI;

  if (!uri) {
    // si no hay URI cortamos el arranque, no tiene sentido seguir
    console.error('[db] falta DB_URI en el .env');
    process.exit(1);
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri);
    console.log('[db] conectado a MongoDB');
  } catch (err) {
    console.error('[db] error conectando:', err.message);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] desconectado');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[db] error:', err.message);
  });

  // el cierre limpio del SIGINT/SIGTERM lo hace ahora index.js
};

export default dbConnect;
