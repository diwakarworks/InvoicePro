"use client"

import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Calendar, Edit3, Camera, Save, X } from 'lucide-react';

const AdminProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const fileInputRef = useRef(null);


    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL

    const fetchAdminUsers = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_URL}/api/admin/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': "application/json"
                },
            });
            const data = await response.json();
            setUser(data);
            setEditData({
                name: data.name,
                email: data.email,
                phone: data.phone,
                profilePicture: data.profilePicture
            });
        } catch (error) {
            console.error(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminUsers();
    }, [fetchAdminUsers]);

    const handleEdit = () => {
        setEditing(true);
    };

    const handleCancel = () => {
        setEditing(false);
        setEditData({
            name: user.name,
            email: user.email,
            phone: user.phone,
            profilePicture: null
        });
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_URL}/api/admin/profile`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': "application/json"
                },
                body: JSON.stringify(editData)
            });
            const updatedUser = await response.json();
            setUser(updatedUser);
            setEditing(false);
            console.log(updatedUser);
        } catch (error) {
            console.error(`Error updating profile: ${error.message}`);
        }
    };

    const handleInputChange = (e) => {
        setEditData({
            ...editData,
            [e.target.name]: e.target.value
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
                    <p className="text-gray-600">Unable to load your profile information.</p>
                </div>
            </div>
        );
    }


    const handleRef = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };


    const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
        // Option 1: Convert to base64 for simple implementation
        const reader = new FileReader();
        reader.onload = (event) => {
            setEditData({
                ...editData,
                profilePicture: event.target.result
            });
        };
        reader.readAsDataURL(file);
    }
}





    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Profile</h1>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Profile Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                        <img
                                            src={editing && editData.profilePicture ? editData.profilePicture : user.profilePicture}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <button onClick={handleRef} className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow">
                                        <Camera className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                                <div className="text-center md:text-left text-white">
                                    <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h2>
                                    <p className="text-blue-100 text-lg">Administrator    </p>
                                    <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-blue-100">Member since {formatDate(user.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Content */}
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-semibold text-gray-900">Profile Information</h3>
                                <div className="flex gap-3">
                                    {editing ? (
                                        <>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                style={{ display: "none" }}
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                            />
                                            <button
                                                onClick={handleSave}
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                            >
                                                <Save className="w-4 h-4" />
                                                Save
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={handleEdit}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            Edit Profile
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    {/* Name Field */}
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="bg-blue-100 p-2 rounded-lg">
                                                <User className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <label className="text-sm font-medium text-gray-700 uppercase tracking-wide">Full Name</label>
                                        </div>
                                        {editing ? (
                                            <input
                                                type="text"
                                                name="name"
                                                value={editData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                                            />
                                        ) : (
                                            <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                                        )}
                                    </div>

                                    {/* Email Field */}
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="bg-green-100 p-2 rounded-lg">
                                                <Mail className="w-5 h-5 text-green-600" />
                                            </div>
                                            <label className="text-sm font-medium text-gray-700 uppercase tracking-wide">Email Address</label>
                                        </div>
                                        {editing ? (
                                            <input
                                                type="email"
                                                name="email"
                                                value={editData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                            />
                                        ) : (
                                            <p className="text-lg text-gray-900">{user.email}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    {/* Phone Field */}
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="bg-purple-100 p-2 rounded-lg">
                                                <Phone className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <label className="text-sm font-medium text-gray-700 uppercase tracking-wide">Phone Number</label>
                                        </div>
                                        {editing ? (
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={editData.phone}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                            />
                                        ) : (
                                            <p className="text-lg text-gray-900">{user.phone}</p>
                                        )}
                                    </div>

                                    {/* Account Details */}
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="bg-indigo-100 p-2 rounded-lg">
                                                <Calendar className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <label className="text-sm font-medium text-gray-700 uppercase tracking-wide">Account Details</label>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Created:</span> {formatDate(user.createdAt)}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Last Updated:</span> {formatDate(user.updatedAt)}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">User ID:</span> {user._id}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
