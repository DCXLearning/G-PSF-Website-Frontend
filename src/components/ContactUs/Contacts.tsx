import React from 'react';
import { Facebook, Send, MessageCircle } from 'lucide-react';

const ContactSection = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 pb-6 pt-6 md:pt-8 md:pb-8 bg-white">
            {/* Header */}
            <div className="text-center mb-12">
                <h3 className="text-indigo-900 text-lg mb-2">Contact Us</h3>
                <h2 className="text-3xl md:text-5xl text-[#1e2653] font-bold">
                    Send Us a Message <br /> to Start a Conversation
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Contact Form */}
                <div className="lg:col-span-2">
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-[#1e2653] mb-2">First Name *</label>
                                <input type="text" placeholder="Ex. Pheak" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#1e2653] mb-2">Last Name *</label>
                                <input type="text" placeholder="Ex. Kdey" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-[#1e2653] mb-2">Email *</label>
                                <input type="email" placeholder="example@gmail.com" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#1e2653] mb-2">Organisation Name</label>
                                <input type="text" placeholder="Enter Organisation Name" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#1e2653] mb-2">Subject *</label>
                            <input type="text" placeholder="Enter subject here..." className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#1e2653] mb-2">Your Message *</label>
                            <textarea rows={6} placeholder="Enter here..." className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"></textarea>
                        </div>

                        <button type="submit" className="bg-[#f39233] cursor-pointer hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition duration-300">
                            Send Message
                        </button>
                    </form>
                </div>

                {/* Sidebar Information */}
                <div className="bg-[#1e2653] text-white p-8 rounded-2xl space-y-8">
                    <section>
                        <h4 className="text-xl font-bold mb-3">Address</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Government Palace, Sisowath Quay, <br />
                            Wat Phnom, Phnom Penh, Cambodia
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h4 className="text-xl font-bold">Contact</h4>
                        <div className="text-sm space-y-1">
                            <p>+855 99 799 579</p>
                            <p>+855 98 799 579</p>
                        </div>

                        <div className="text-sm pt-2">
                            <p className="font-bold">General</p>
                            <p>helpdesk@cdc.gov.kh</p>
                            <p>info@cdc.gov.kh</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 pt-2">
                            {[
                                { label: 'China Desk', email: 'chinadesk@cdc.gov.kh' },
                                { label: 'EU Desk', email: 'eudesk@cdc.gov.kh' },
                                { label: 'Japan Desk', email: 'japandesk@cdc.gov.kh' },
                                { label: 'Korea Desk', email: 'koreadesk@cdc.gov.kh' },
                            ].map((desk) => (
                                <div key={desk.label}>
                                    <p className="font-bold">{desk.label}</p>
                                    <p className="text-gray-300">{desk.email}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h4 className="text-xl font-bold mb-3">Open Time</h4>
                        <p className="text-sm text-gray-300">From Monday to Friday</p>
                        <p className="text-sm">7:30 to 11:30am and 14:00 to 17:30pm</p>
                    </section>

                    <section>
                        <h4 className="text-xl font-bold mb-4">Stay Connected</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="bg-[#f39233] p-2 rounded-full hover:bg-orange-400 transition"><Facebook size={20} /></a>
                            <a href="#" className="bg-[#f39233] p-2 rounded-full hover:bg-orange-400 transition"><Send size={20} /></a>
                            <a href="#" className="bg-[#f39233] p-2 rounded-full hover:bg-orange-400 transition"><MessageCircle size={20} /></a>
                        </div>
                    </section>
                </div>
            </div>

            {/* Map Section */}
            <div className="w-full h-[500px] bg-gray-200 overflow-hidden rounded-2xl shadow-inner">
                <iframe
                    title="CDC Cambodia Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.770535316462!2d104.9255855758416!3d11.568305044030615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3109515ad9d95963%3A0xf0260c4d444dee3a!2sThe%20Council%20for%20the%20Development%20of%20Cambodia!5e0!3m2!1sen!2skh!4v1704810000000!5m2!1sen!2skh"
                    className="w-full h-full border-0"
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
        </div>
    );
};

export default ContactSection;