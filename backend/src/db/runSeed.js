const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

/**
 * Ejecuta el script de datos de prueba (DatosParaDB.sql).
 * Es idempotente: usa NOT EXISTS en cada INSERT, así que correrlo
 * varias veces no duplica datos.
 */
async function ejecutarSeed() {
  const rutaSeed = path.join(__dirname, 'DatosParaDB.sql');
  const contenidoSql = fs.readFileSync(rutaSeed, 'utf8');

  const client = await pool.connect();

  try {
    console.log('Ejecutando datos de prueba (DatosParaDB.sql)...');
    await client.query(contenidoSql);
    console.log('Datos de prueba cargados correctamente.');
  } catch (error) {
    console.error('Error cargando datos de prueba:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

ejecutarSeed();