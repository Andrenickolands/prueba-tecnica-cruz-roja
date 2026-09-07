export default function Footer() {
  const anioActual = new Date().getFullYear();

  return (
    <footer className="footer-institucional">
      <p>© {anioActual} Cruz Roja Colombiana - Todos los derechos reservados.</p>
    </footer>
  );
}