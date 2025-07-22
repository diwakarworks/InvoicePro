"use client";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Mobile Image */}
          <div className="block md:hidden">
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <svg className="w-32 h-32 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
              Something is not right...
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Page you are trying to open does not exist. You may have mistyped the address, or the
              page has been moved to another URL. If you think this is an error contact support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                onClick={() => router.push('/')}
                className="bg-white  text-blue-500 font-semibold px-8 py-3 rounded-lg border-2 border-blue-500 transition-colors "
              >
                Get back to home page
              </button>
            </div>
          </div>

          {/* Desktop Image */}
          <div className="hidden md:block">
            <div className="w-full h-96 relative">
              <Image
                src="/404 not found.svg"
                alt="404 Error - Page Not Found"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}