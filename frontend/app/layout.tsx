import { AuthProvider } from '../context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'BookIt - Secure Event Management Marketplace',
  description: 'Discover and book elite corporate and social events effortlessly.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}