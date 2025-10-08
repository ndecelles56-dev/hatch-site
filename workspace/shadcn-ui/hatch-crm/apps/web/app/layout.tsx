import './globals.css';
import Link from 'next/link';
import type { ReactNode } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/people', label: 'People' },
  { href: '/tour-booker', label: 'Tour Booker' },
  { href: '/agreements/buyer-rep', label: 'BBA Wizard' },
  { href: '/mls/preflight', label: 'Publishing Check' }
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 py-4">
            <div className="text-xl font-semibold text-brand-700">Hatch CRM</div>
            <nav className="flex gap-4 text-sm font-medium text-slate-600">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-brand-600">
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>
          <main className="flex-1 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
