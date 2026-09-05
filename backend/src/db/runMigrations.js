const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function ejecutarMigraciones() {
  const carpetaMigraciones = path.join(__dirname, 'migrations');
  const archivos = fs.readdirSync(carpetaMigraciones)
    .filter((archivo) => archivo.endsWith('.sql'))
    .sort(); // el prefijo numérico (000, 001, 002...) garantiza el orden

  const client = await pool.connect();

  try {
    for (const archivo of archivos) {
      const rutaCompleta = path.join(carpetaMigraciones, archivo);
      const contenidoSql = fs.readFileSync(rutaCompleta, 'utf8');

      console.log(`Ejecutando migración: ${archivo}`);
      await client.query(contenidoSql);
    }
    console.log('Todas las migraciones se ejecutaron correctamente.');
  } catch (error) {
    console.error('Error ejecutando migraciones:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

ejecutarMigraciones();