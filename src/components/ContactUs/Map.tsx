import React from 'react';
import { Facebook, Send, MessageCircle } from 'lucide-react';

const Map = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4">
            <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-sm overflow-hidden">

                {/* Contact Form & Info Section */}
                <div className="p-6 md:p-12">
                    <div className="text-center mb-12">
                        <h3 className="text-indigo-900 font-bold text-lg mb-2">Contact Us</h3>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-[#1e2653] leading-tight">
                            Send Us a Message <br /> to Start a Conversation
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Form */}
                        <div className="lg:col-span-2">
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#1e2653]">First Name *</label>
                                        <input type="text" placeholder="Ex. Pheak" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-400 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#1e2653]">Last Name *</label>
                                        <input type="text" placeholder="Ex. Kdey" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-400 outline-none transition-all" />
                                    </div>
                                </div>
                                {/* ... other form fields (Email, Subject, Message) ... */}
                                <button type="submit" className="bg-[#f39233] hover:bg-orange-600 text-white font-bold py-3 px-10 rounded-full shadow-lg shadow-orange-200 transition-all active:scale-95">
                                    Send Message
                                </button>
                            </form>
                        </div>

                        {/* Sidebar Info */}
                        <div className="bg-[#1e2653] text-white p-8 rounded-2xl space-y-8">
                            <section>
                                <h4 className="text-xl font-bold mb-3">Address</h4>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    Government Palace, Sisowath Quay, Wat Phnom, Phnom Penh, Cambodia
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h4 className="text-xl font-bold">Contact</h4>
                                <div className="text-sm space-y-1">
                                    <p>+855 99 799 579</p>
                                    <p>+855 98 799 579</p>
                                </div>
                                <div className="pt-2">
                                    <p className="font-bold">General</p>
                                    <p className="text-sm">helpdesk@cdc.gov.kh</p>
                                    <p className="text-sm">info@cdc.gov.kh</p>
                                </div>
                            </section>

                            <section>
                                <h4 className="text-xl font-bold mb-3">Open Time</h4>
                                <p className="text-sm text-gray-300">Monday to Friday</p>
                                <p className="text-sm font-medium">7:30 to 11:30am and 14:00 to 17:30pm</p>
                            </section>

                            <div className="flex gap-4">
                                <div className="p-2 bg-orange-500 rounded-full cursor-pointer hover:bg-orange-400"><Facebook size={18} /></div>
                                <div className="p-2 bg-orange-500 rounded-full cursor-pointer hover:bg-orange-400"><Send size={18} /></div>
                                <div className="p-2 bg-orange-500 rounded-full cursor-pointer hover:bg-orange-400"><MessageCircle size={18} /></div>
                            </div>
                        </div>
                    </div>
                </div>

                
            </div>
        </div>
    );
};

export default Map;