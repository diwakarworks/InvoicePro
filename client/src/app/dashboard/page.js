"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle,  FileText, Users, X, CreditCard, Calendar, Building, User, AlertCircle, Router, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL

const DashboardPage = ({ }) => {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    totalRevenue: 0,
  });
  const [userData, setUserData] = useState(null);
  const router = useRouter();
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadDashboardData(token);
    } else {
      setError('No authentication token found');
      setLoading(false);
    }

    // Check for payment success/failure in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    const invoiceId = urlParams.get('invoice_id');
    const sessionId = urlParams.get('session_id');

    if (paymentStatus && invoiceId) {
      handlePaymentReturn(paymentStatus, invoiceId, sessionId);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        };

        const userRes = await axios.get(`${API_URL}/api/users/profile`, config);
        setUserData(userRes.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchData();
  }, []);

  const loadDashboardData = async (token) => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      console.log('Making API calls to:', API_URL);

      const [clientsRes, invoicesRes] = await Promise.all([
        axios.get(`${API_URL}/api/clients`, config),
        axios.get(`${API_URL}/api/invoices`, config),
      ]);

      const clientsData = Array.isArray(clientsRes.data) ? clientsRes.data : [];
      const invoicesData = Array.isArray(invoicesRes.data) ? invoicesRes.data : [];

      setClients(clientsData);

      const paid = invoicesData.filter((inv) => inv && inv.status === 'paid');
      const revenue = paid.reduce((sum, inv) => sum + (inv.total || 0), 0);

      setStats({
        totalClients: clientsData.length,
        totalInvoices: invoicesData.length,
        paidInvoices: paid.length,
        totalRevenue: revenue,
      });

      setRecentInvoices(invoicesData.slice(0, 5));
      setLoading(false);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError(`Failed to load data: ${err.response?.data?.message || err.message}`);
      setLoading(false);
    }
  };

  // Handle payment return from payment provider
  const handlePaymentReturn = async (paymentStatus, invoiceId, sessionId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (paymentStatus === 'success') {
        // Call webhook to update payment status
        await processPaymentWebhook(invoiceId, 'paid', sessionId);
        
        // Show success message
        alert('Payment successful! Your invoice has been marked as paid.');
        
        // Refresh dashboard data
        await loadDashboardData(token);
      } else if (paymentStatus === 'cancel') {
        alert('Payment was cancelled.');
      } else {
        alert('Payment failed. Please try again.');
      }

      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } catch (error) {
      console.error('Error handling payment return:', error);
      alert('Error processing payment status. Please refresh the page.');
    }
  };

  // Process payment webhook
  const processPaymentWebhook = async (invoiceId, status, sessionId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Get invoice details to get the amount
      const invoiceRes = await axios.get(`${API_URL}/api/invoices/${invoiceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const invoice = invoiceRes.data;
      
      // Call webhook endpoint
      await axios.post(`${API_URL}/api/payments/webhook`, {
        invoiceId: invoiceId,
        status: status,
        amount: invoice.total,
        sessionId: sessionId
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Webhook processed successfully');
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }
  };

  const handlePayment = async (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentLoading(true);
    setPaymentError(null);
    setShowPaymentModal(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${API_URL}/api/payments/checkout-session`, 
        {
          invoiceId: invoice._id,
          // Add return URLs with payment status
          successUrl: `${window.location.origin}${window.location.pathname}?payment_status=success&invoice_id=${invoice._id}`,
          cancelUrl: `${window.location.origin}${window.location.pathname}?payment_status=cancel&invoice_id=${invoice._id}`
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.sessionUrl) {
        // Redirect to payment provider
        window.location.href = response.data.sessionUrl;
      } else {
        throw new Error('No session URL received from server');
      }

    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(
        error.response?.data?.message || 
        error.message || 
        'Payment failed. Please try again.'
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  // Test webhook endpoint
  const testWebhook = async (invoiceId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/payments/webhook`, {
        invoiceId: invoiceId,
        status: 'paid',
        amount: 100 // Test amount
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Test webhook response:', response.data);
      alert('Test webhook successful');
      
      // Refresh dashboard data
      const tokenRefresh = localStorage.getItem('token');
      if (tokenRefresh) {
        await loadDashboardData(tokenRefresh);
      }
    } catch (error) {
      console.error('Test webhook error:', error);
      alert('Test webhook failed. Check console for details.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl border border-red-200 shadow-sm p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h1>
              <p className="text-red-600 mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    const token = localStorage.getItem('token');
                    if (token) loadDashboardData(token);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center lg:text-left"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Billing & Invoices
          </h1>
          
          <p className="text-gray-600 text-lg">
            Welcome back, <span className="font-semibold text-gray-800">{userData?.name || 'User'}</span>!
          </p>
          <div className='flex justify-end'>
            <button onClick={()=> router.push('/dashboard/stats')} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md disabled:opacity-50">              
            STATS
          </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            title="Total Clients"
            value={stats.totalClients}
            icon={<Users className="text-blue-600 w-8 h-8" />}
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Total Invoices"
            value={stats.totalInvoices}
            icon={<FileText className="text-purple-600 w-8 h-8" />}
            gradient="from-purple-500 to-purple-600"
          />
          <StatCard
            title="Paid Invoices"
            value={stats.paidInvoices}
            icon={<CheckCircle className="text-green-600 w-8 h-8" />}
            gradient="from-green-500 to-green-600"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={<IndianRupee className="text-yellow-600 w-8 h-8" />}
            gradient="from-yellow-500 to-yellow-600"
          />
        </motion.div>

        {/* Clients Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Recent Clients ({clients.length})
            </h2>
          </div>

          {clients.length > 0 ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.slice(0, 6).map((client, index) => (
                  <motion.div
                    key={client._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{client.name}</h3>
                        <p className="text-sm text-gray-500">{client.email}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No clients found</p>
              <p className="text-gray-400 text-sm">Create your first client to get started</p>
            </div>
          )}
        </motion.div>

        {/* Recent Invoices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Recent Invoices ({recentInvoices.length})
            </h2>
          </div>

          {recentInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Invoice ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentInvoices.map((invoice, index) => (
                    <motion.tr
                      key={invoice._id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              #{invoice._id?.slice(-6) || 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ₹{invoice.total?.toLocaleString() || '0'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.createdAt
                          ? new Date(invoice.createdAt).toLocaleDateString('en-GB')
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.dueDate
                          ? new Date(invoice.dueDate).toLocaleDateString('en-GB')
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${invoice.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'unpaid'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {invoice.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {invoice.status !== 'paid' && (
                            <button
                              onClick={() => handlePayment(invoice)}
                              disabled={paymentLoading}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md disabled:opacity-50"
                            >
                              {paymentLoading ? 'Processing...' : 'Pay Now'}
                            </button>
                          )}
                          {/* Test webhook button for development */}
                          <button
                            onClick={() => testWebhook(invoice._id)}
                            className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-xs"
                          >
                            Test Webhook
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No recent invoices found</p>
              <p className="text-gray-400 text-sm">Create your first invoice to get started</p>
            </div>
          )}
        </motion.div>

        {/* Payment Error Display */}
        {paymentError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2"
          >
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-600">{paymentError}</p>
            <button
              onClick={() => setPaymentError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, gradient }) => (
  <motion.div
    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-lg bg-gradient-to-r ${gradient} bg-opacity-10`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

export default DashboardPage;