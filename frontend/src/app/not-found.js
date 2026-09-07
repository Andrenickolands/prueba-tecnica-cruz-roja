import LogoCruz from '@/components/LogoCruz';
import IlustracionEquipo from '@/components/IlustracionEquipo';
import styles from './not-found.module.css';

export default function NoEncontrado() {
  return (
    <main className={styles.contenedor}>
      <div className={styles.tarjeta}>
        <IlustracionEquipo className={styles.ilustracion} />

        <div className={styles.contenido}>
          <div className={styles.encabezadoCentrado}>
            <LogoCruz tamano={56} />
            <p className={styles.codigo}>404</p>
          </div>

          <h1>No encontramos esta página</h1>
          <p className={styles.descripcion}>
            La jornada o página que buscas no existe, fue eliminada, o la dirección tiene un error.
          </p>
          <a href="/jornadas" className={styles.boton}>
            Volver al listado de jornadas
          </a>
        </div>
      </div>
    </main>
  );
}