"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  FileText, 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight,
  MoreVertical
} from "lucide-react";
import axios from "axios";


const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function AdminPanel() {
  const [user,setUser] = useState();
  const router = useRouter();
  const [activeCard, setActiveCard] = useState(null);



  const quickActions = [
    {
      title: "All Clients",
      description: "Manage registered clients and their data",
      icon: Users,
      route: "/clients",
      color: "from-blue-500 to-indigo-600",
      bgPattern: "bg-gradient-to-br from-blue-50 to-indigo-100"
    },
    {
      title: "Invoices Management",
      description: "Monitor, create and manage invoicing operations",
      icon: FileText,
      route: "/invoices",
      color: "from-emerald-500 to-teal-600",
      bgPattern: "bg-gradient-to-br from-emerald-50 to-teal-100"
    },
    {
      title: "Stripe Payments",
      description: "View transactions and payment analytics",
      icon: CreditCard,
      route: "/admin/stripe",
      color: "from-purple-500 to-violet-600",
      bgPattern: "bg-gradient-to-br from-purple-50 to-violet-100"
    }
  ];

  useEffect(()=> {
    fetchadminUsers();
  },[])

  const fetchadminUsers = async() => {
    try{
        const token = localStorage.getItem('adminToken')
        const response = await axios.get(`${API_URL}/api/admin/profile`, {
            headers:{
                Authorization: `Bearer ${token}`,
                'Content-Type':"application/json"
            },
        })
        const data = response.data;
        setUser(data);
    }
    catch (error){
        console.error(`Error:${error.message}`)
    }
  }

  const handleAdminProfile  = () => {
    router.push('/admin/profile')
  } 
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-sm text-gray-500">Welcome back {user?.name}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100/60 rounded-lg px-3 py-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                <button  onClick={handleAdminProfile}className="text-sm font-medium text-gray-700">{user?.name}</button >
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-8">


        {/* Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <div key={index} className="group relative">
                <div 
                  className={`${action.bgPattern} rounded-3xl p-8 border border-white/60 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer overflow-hidden relative`}
                  onClick={() => router.push(action.route)}
                  onMouseEnter={() => setActiveCard(index)}
                  onMouseLeave={() => setActiveCard(null)}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-current to-transparent rounded-full transform rotate-45"></div>
                    <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-current to-transparent rounded-full"></div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                        <action.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors duration-200">
                          {action.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {action.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-end pt-4 border-t border-white/50">
                        <div className={`flex items-center space-x-1 text-sm font-medium bg-gradient-to-r ${action.color} bg-clip-text text-transparent`}>
                          <span>View Details</span>
                          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}