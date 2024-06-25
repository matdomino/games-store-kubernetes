import { Inter } from 'next/font/google';

import { UserProvider } from './context/UserContext';
import { NextAuthProvider } from './context/NextAuthProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Games Store',
  description: 'Frontend + express + mongodb',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <NextAuthProvider>
        <UserProvider>
          <body className={inter.className}>{children}</body>
        </UserProvider>
      </NextAuthProvider>
    </html>
  );
}
