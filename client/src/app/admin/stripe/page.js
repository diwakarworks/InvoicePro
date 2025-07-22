"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card/page";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function StripePaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${API_URL}/api/payments`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                });
                const data = await res.json();
                console.log(data);
                setPayments(data);
            } catch (err) {
                console.error("Failed to load payments", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);


    return (
        <div className="min-h-screen p-8 bg-gray-100">
            <h1 className="text-3xl font-bold mb-6">Stripe Payments</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {payments.map((payment) => (
                    <Card key={payment._id}>
                        <CardContent className="space-y-2">
                            <p className="text-lg font-semibold">Amount: ₹{payment.amount}</p>
                            <p>Status: <span className="capitalize">{payment.status}</span></p>
                            <p>Invoice Id: {payment.invoiceId}</p>
                            <p>Date: {new Date(payment.paidAt).toLocaleString('en-GB')}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
