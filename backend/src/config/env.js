require('dotenv').config();

const requiredEnvVars = ['DATABASE_URL', 'PORT'];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Falta la variable de entorno requerida: ${key}`);
  }
}

module.exports = {
  port: process.env.PORT,
  databaseUrl: process.env.DATABASE_URL,
};