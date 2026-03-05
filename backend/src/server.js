const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
  console.log(`==================================================\n`);
});
