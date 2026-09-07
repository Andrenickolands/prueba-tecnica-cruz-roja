import { Public_Sans } from 'next/font/google';
import Footer from '@/components/Footer';
import './globals.css';

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--fuente-base',
  display: 'swap',
});

export const metadata = {
  title: 'Cruz Roja Colombiana — Jornadas',
  description: 'Gestión de jornadas y cupos de la Cruz Roja Colombiana',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={publicSans.variable}>
      <body>
        <a href="#contenido-principal" className="enlace-saltar">
          Saltar al contenido principal
        </a>
        {children}
        <Footer />
      </body>
    </html>
  );
}