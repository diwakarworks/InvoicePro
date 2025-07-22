// Updated component - remove the manual clientId input and use the route parameter

"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Minus, Calendar, User, DollarSign, FileText, Save, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const CreateInvoicePage = () => {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [client, setClient] = useState(null);
    const [userClients, setUserClients] = useState([]);
    
    // Handle different route parameter names
    const clientId = params.id || params.clientId || params.client;

    const [formData, setFormData] = useState({
        clientId: '', // Start with empty, let user input
        items: [{ description: '', amount: 0 }],
        dueDate: '',
        total: 0
    });

    useEffect(() => {
        // Fetch all user's clients for the dropdown
        const fetchUserClients = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/clients`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const clients = await response.json();
                    setUserClients(clients);
                }
            } catch (error) {
                console.error('Error fetching clients:', error);
            }
        };

        fetchUserClients();
    }, []);

    useEffect(() => {
        // Debug route parameters
        console.log('All route params:', params);
        console.log('Extracted clientId:', clientId);
        
        // Optionally pre-fill clientId from route parameter if it exists
        if (clientId && !formData.clientId) {
            setFormData(prev => ({ ...prev, clientId }));
        }
    }, [clientId, formData.clientId, params]);

    useEffect(() => {
        // Fetch client details
        const fetchClient = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/clients/${clientId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const clientData = await response.json();
                    setClient(clientData);
                } else {
                    console.error('Failed to fetch client');
                }
            } catch (error) {
                console.error('Error fetching client:', error);
            }
        };

        if (clientId) {
            fetchClient();
        }
    }, [clientId]);

    // Calculate total whenever items change
    useEffect(() => {
        const total = formData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        setFormData(prev => ({ ...prev, total }));
    }, [formData.items]);

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { description: '', amount: 0 }]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length > 1) {
            setFormData(prev => ({
                ...prev,
                items: prev.items.filter((_, i) => i !== index)
            }));
        }
    };

    const updateItem = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/invoices`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData) // Use formData directly
            });
            const data = await response.json();
            console.log(data);

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/invoices');
                }, 2000);
            } else {
                throw new Error(data.message || 'Failed to create invoice');
            }
        } catch (error) {
            console.error('Error creating invoice:', error);
            alert(error.message); // Show the actual error message to user
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center">
                <div className="text-center space-y-6 animate-pulse">
                    <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                        <CheckCircle className="w-12 h-12 text-white animate-bounce" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                            Invoice Created Successfully!
                        </h2>
                        <p className="text-gray-600">Redirecting to invoices...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Header */}
            <div className="relative bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.back()}
                                className="group p-2 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                        Create Invoice
                                    </h1>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                            <span className="text-sm text-gray-600">Professional Invoice</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Client Info Card - Display only when client is loaded from route */}
                    {client && (
                        <div className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Client Information</h2>
                                    <p className="text-gray-600">Invoice recipient details</p>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200/50">
                                <div className="space-y-2">
                                    <p className="font-semibold text-gray-900">{client.name}</p>
                                    <p className="text-gray-600">{client.email}</p>
                                    <p className="text-sm text-gray-500">ID: {clientId}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Client ID Input Card */}
                    <div className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Client ID</h2>
                                <p className="text-gray-600">Enter the unique identifier for the client</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {/* Client Selector Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Client from List
                                </label>
                                <select
                                    value={formData.clientId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                                >
                                    <option value="">-- Select a client --</option>
                                    {userClients.map(client => (
                                        <option key={client._id} value={client._id}>
                                            {client.name} ({client.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* OR Divider */}
                            <div className="flex items-center space-x-4">
                                <hr className="flex-1 border-gray-300" />
                                <span className="text-sm text-gray-500 font-medium">OR</span>
                                <hr className="flex-1 border-gray-300" />
                            </div>

                            {/* Manual Client ID Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter Client ID Manually
                                </label>
                                <input
                                    type="text" 
                                    placeholder="Enter client ID..."
                                    value={formData.clientId} 
                                    onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                                />
                            </div>
                        </div>
                        
                        {/* Debug Info */}
                        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm">
                            <p><strong>Debug Info:</strong></p>
                            <p>Route param clientId: <code>{clientId || 'undefined'}</code></p>
                            <p>Current form clientId: <code>{formData.clientId || 'empty'}</code></p>
                            <p>Available clients: {userClients.length}</p>
                        </div>
                        
                        {formData.clientId && (
                            <p className="mt-2 text-sm text-green-600">
                                ✓ Selected Client ID: <span className="font-mono font-semibold">{formData.clientId}</span>
                            </p>
                        )}
                    </div>

                    {/* Due Date Card */}
                    <div className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl shadow-lg">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Due Date</h2>
                                <p className="text-gray-600">When payment is expected</p>
                            </div>
                        </div>
                        <input
                            type="date"
                            required
                            value={formData.dueDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        />
                    </div>

                    {/* Items Card */}
                    <div className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Invoice Items</h2>
                                    <p className="text-gray-600">Add services or products</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={addItem}
                                className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                                <span>Add Item</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="group/item bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder="Service description..."
                                                value={item.description}
                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                                                required
                                            />
                                        </div>
                                        <div className="w-32">
                                            <input
                                                type="number"
                                                placeholder="Amount"
                                                value={item.amount}
                                                onChange={(e) => updateItem(index, 'amount', parseFloat(e.target.value) || 0)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                                                required
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        {formData.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total Section */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50">
                                <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    ₹{formData.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            disabled={loading || !formData.clientId}
                            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-center space-x-3">
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Creating Invoice...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                                        <span>Create Invoice</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateInvoicePage;