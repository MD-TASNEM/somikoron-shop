import React, { useState } from "react";
import {
  Settings,
  Bell,
  Shield,
  Globe,
  CreditCard,
  Truck,
  Mail,
  Save,
  Database,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

export const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
    { id: "shipping", label: "Shipping", icon: Truck },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-secondary">
          System Settings
        </h1>
        <p className="text-secondary/60 text-lg">
          Configure your store's global parameters and security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar Tabs */}
        <div className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-secondary/40 hover:bg-secondary/5 hover:text-secondary"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-8">
          {activeTab === "general" && (
            <section className="bg-white p-10 rounded-premium shadow-sm border border-secondary/5 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">General Settings</h2>
                <button className="flex items-center gap-2 text-primary font-bold hover:underline">
                  <Save className="w-5 h-5" /> Save Changes
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-secondary/60">
                    Store Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Somikoron Shop"
                    className="w-full px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-secondary/60">
                    Support Email
                  </label>
                  <input
                    type="email"
                    defaultValue="support@somikoron.com"
                    className="w-full px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-secondary/60">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    defaultValue="01996570203"
                    className="w-full px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-secondary/60">
                    Currency
                  </label>
                  <select className="w-full px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold">
                    <option>BDT (৳)</option>
                    <option>USD ($)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary/60">
                  Store Address
                </label>
                <textarea
                  defaultValue="Islamic university, Bangladesh Main gate, Jhenaidah, kushtia"
                  className="w-full px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all h-32"
                />
              </div>
            </section>
          )}

          {activeTab === "security" && (
            <section className="bg-white p-10 rounded-premium shadow-sm border border-secondary/5 space-y-8">
              <h2 className="text-2xl font-bold">Security & API Keys</h2>

              <div className="space-y-6">
                <div className="p-6 bg-secondary/5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-primary" />
                      <h3 className="font-bold">MongoDB Connection</h3>
                    </div>
                    <span className="px-3 py-1 bg-success/10 text-success rounded-full text-[10px] font-bold uppercase tracking-widest">
                      Connected
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      readOnly
                      value="mongodb+srv://admin:password@cluster0.mongodb.net/somikoron"
                      className="w-full px-6 py-4 bg-white border-none rounded-xl outline-none text-sm font-mono"
                    />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/20 hover:text-secondary">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-secondary/5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-primary" />
                    <h3 className="font-bold">JWT Secret Key</h3>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      readOnly
                      value="super-secret-jwt-key-2026"
                      className="w-full px-6 py-4 bg-white border-none rounded-xl outline-none text-sm font-mono"
                    />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/20 hover:text-secondary">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === "shipping" && (
            <section className="bg-white p-10 rounded-premium shadow-sm border border-secondary/5 space-y-8">
              <h2 className="text-2xl font-bold">Shipping Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-secondary/60">
                    Inside Kushtia Fee (৳)
                  </label>
                  <input
                    type="number"
                    defaultValue="70"
                    className="w-full px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-secondary/60">
                    Outside Kushtia Fee (৳)
                  </label>
                  <input
                    type="number"
                    defaultValue="130"
                    className="w-full px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
