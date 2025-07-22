'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

const  Navbar = () => {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    router.push('/auth/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href={'/'} className="text-xl -ml-28 font-bold text-blue-600">
          InvoicePro
        </Link>
        <ul className="flex items-center space-x-8 text-sm text-gray-700">
          <li onClick={() => router.push('/admin')} className="hover:text-blue-500 cursor-pointer">
            ADMIN
          </li>
          <li onClick={() => router.push('/dashboard')} className="hover:text-blue-500 cursor-pointer ">
            DASHBOARD
          </li>
          <li onClick={() => router.push('/invoices')} className="hover:text-blue-500 cursor-pointer">
            INVOICES
          </li>
          <li onClick={() => router.push('/clients')} className="hover:text-blue-500 cursor-pointer">
            CLIENTS
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="bg-red-500  hover:bg-red-600 -mr-40 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
