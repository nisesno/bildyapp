import app from './app.js';
import dbConnect from './config/db.js';

const PORT = process.env.PORT || 3000;

// conectamos a Mongo antes de levantar el servidor
await dbConnect();

app.listen(PORT, () => {
  console.log(`[server] API escuchando en http://localhost:${PORT}`);
});
