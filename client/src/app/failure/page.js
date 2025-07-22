"use client";

import { XCircleIcon } from "@heroicons/react/24/solid";

export default function PaymentFailure() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="bg-white p-8 rounded-xl shadow-md text-center space-y-4">
        <XCircleIcon className="h-16 w-16 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold text-red-600">Payment Failed!</h1>
        <p className="text-gray-600">Oops! Something went wrong with the payment process.</p>
        <a
          href="/payments"
          className="inline-block mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Try Again
        </a>
      </div>
    </div>
  );
}
