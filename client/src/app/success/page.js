"use client";

import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen   flex items-center justify-center bg-green-50">
      <div className="bg-white -mt-20 p-8 rounded-xl shadow-md text-center space-y-4">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold text-green-600">Payment Successful!</h1>
        <p className="text-gray-600">Thank you! Your invoice has been paid successfully.</p>
        <a
          href="/dashboard"
          className="inline-block mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
