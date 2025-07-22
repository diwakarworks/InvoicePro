"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ClientForm from "@/components/ClientForm";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const EditClientPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
            fetchClient();
    }, [fetchClient]);

    const fetchClient = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/clients/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
            });

            if (!res.ok) throw new Error("Failed to fetch client");
            const data = await res.json();
            setClient(data);
        } catch (err) {
            console.error(err);
            alert("Failed to load client data");
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/clients/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to update client");
            alert("Client updated successfully!");
            router.push('/clients'); // Navigate back to clients list
        } catch (err) {
            console.error(err);
            alert("Something went wrong.");
        }
    };



    const handleDelete = async () => {
        const confirmDelete = window.confirm('Are you sure you want to delete this client?')

        if (!confirmDelete) {
            return;
        }
        try {
            const token = localStorage.getItem('token')
            const res = await axios.delete(`${API_URL}/api/clients/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            })
            alert('Client Deleted Successfully')
            router.push('/clients');
            const data = res.data;
            console.log(data);
        }
        catch (error) {
            console.error(`Error: ${error.message}`)
        }

    }

    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading client data...</p>
                </div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="p-8 flex justify-center items-center">
                <div className="text-center">
                    <p className="text-red-600">Client not found</p>
                    <button
                        onClick={() => router.push('/clients')}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Back to Clients
                    </button>
                </div>


            </div>
        );
    }

    return (
        <div className="p-8 flex justify-center items-start">
            <div className="w-full max-w-2xl">
                <div className="mb-6">
                    <h1 className="text-3xl ml-4 font-bold text-gray-900">Edit Client</h1>
                </div>
                <ClientForm
                    onSubmit={handleFormSubmit}
                    initialData={client}
                    isEditing={true}
                />
            </div>
            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={handleDelete}
                    className="absolute mt-[597px] -ml-60 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                    Delete
                </button>
            </div>


        </div>
    );
};

export default EditClientPage;
