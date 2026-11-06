import './globals.css';
import { Agentation } from 'agentation';

export const metadata = {
  title: 'Virtual XP',
  description: 'Immersive Real Estate Experience',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        {process.env.NODE_ENV === 'development' && <Agentation />}
      </body>
    </html>
  );
}
