"use client";
import { useEffect } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function PaymentSuccess() {
 useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const invoiceId = params.get('invoiceId');
  const token = localStorage.getItem('token');

  if (invoiceId) {
    fetch(`${API_URL}/api/invoices/${invoiceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(invoice => {
        fetch(`${API_URL}/api/payments/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceId, status: 'paid', amount: invoice.total }),
        });
      });
  }
}, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white -mt-20 p-8 rounded-xl shadow-md text-center space-y-4">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold text-green-600">Payment Successful!</h1>
        <p className="text-gray-600">Thank you! Your invoice has been paid successfully.</p>
        <a href="/dashboard"
          className="inline-block mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}