import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Home() {
    const navigate = useNavigate();
    const [s, setS] = useState({});

    useEffect(() => {
        api.get("/public/settings").then(res => setS(res.data)).catch(() => { });
    }, []);

    return (
        <div className="bg-slate-50 text-slate-900 font-sans antialiased min-h-screen flex flex-col">
            {/* ==================== HEADER ==================== */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-600">
                                <img src="mits-logo.png" alt="" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="hidden lg:block text-xl font-bold tracking-tight text-slate-900 leading-none">
                                    {s.college_name || "Madhav Institute of Technology and Science, Gwalior [M.P]"}
                                </h1>
                                <h1 className="block lg:hidden text-xl font-bold tracking-tight text-slate-900 leading-none">
                                    MITS Gwalior
                                </h1>
                                <span className="hidden sm:block text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
                                    {s.college_subtitle || "Deemed University"}
                                </span>
                            </div>
                        </div>

                        {/* Nav */}
                        <nav className="hidden md:flex items-center gap-4 lg:gap-8">
                            <a className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors" href="#hero">Home</a>
                            <a className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors" href="#roles">Roles</a>
                            <a className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors" href="#about">About</a>
                            <a className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors" href="#facilities">Facilities</a>
                            <a className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors" href="#contact">Contact</a>
                        </nav>

                        {/* Login Button */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate("/login?role=STUDENT")}
                                className="hidden sm:flex items-center justify-center h-10 px-6 rounded-lg bg-blue-600 text-white text-sm font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                            >
                                Student Login
                            </button>
                            <button className="md:hidden p-2 text-slate-500 hover:text-slate-900">
                                <span className="material-symbols-outlined">menu</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ==================== MAIN ==================== */}
            <main className="flex-grow">

                {/* ---- HERO ---- */}
                <section id="hero" className="relative bg-slate-900 h-[560px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/30 z-10" />
                        <img
                            alt="MITS Gwalior Campus"
                            className="w-full h-full object-cover opacity-60"
                            src="/MITS Picture.jpeg"
                        />
                    </div>

                    <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-white">
                        <div className="max-w-2xl">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-xs font-semibold tracking-wide uppercase text-amber-500">
                                    Welcome
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
                                Your Home Away <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
                                    From Home
                                </span>
                            </h1>

                            <p className="text-lg md:text-xl text-slate-300 mb-8 font-light max-w-lg leading-relaxed">
                                {s.hero_subtitle || "Experience a safe, comfortable, and vibrant campus life at Madhav Institute of Technology and Science [DU], Gwalior."}
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => navigate("/login?role=STUDENT")}
                                    className="h-12 px-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
                                >
                                    <span>Apply for Hostel</span>
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                                <button
                                    onClick={() => navigate("/gallery")}
                                    className="h-12 px-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white font-semibold transition-all flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined">photo_library</span>
                                    <span>Gallery</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ---- MARQUEE TICKER ---- */}
                <div className="bg-slate-800 text-white py-3 overflow-hidden relative border-t border-slate-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4">
                        <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-500 whitespace-nowrap">
                            <span className="material-symbols-outlined text-base">campaign</span>
                            Latest Updates
                        </span>
                        <div className="flex-1 overflow-hidden relative h-6">
                            <div className="marquee-track whitespace-nowrap absolute top-0 flex items-center gap-12 text-sm text-slate-300">
                                {(s.marquee_text || "Welcome to official Hostel Management System of MITS Gwalior|Login via Student Email to get access to all features").split("|").map((t, i) => (
                                    <span key={i}>{t.trim()}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ---- ROLE CARDS ---- */}
                <section id="roles" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-30">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Student */}
                        <div className="group bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 p-6 transition-all duration-300 hover:-translate-y-1">
                            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl">school</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Student Login</h3>
                            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                                Access your hostel profile, pay fees, view mess menu, and submit
                                leave applications.
                            </p>
                            <button
                                onClick={() => navigate("/login?role=STUDENT")}
                                className="inline-flex items-center justify-center w-full h-10 rounded-lg bg-slate-50 text-blue-600 font-bold text-sm border border-slate-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all"
                            >
                                Login as Student
                            </button>
                        </div>

                        {/* Warden */}
                        <div className="group bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 p-6 transition-all duration-300 hover:-translate-y-1">
                            <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl">supervisor_account</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Warden Login</h3>
                            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                                Manage student records, approve leaves, handle room allocations,
                                and monitor complaints.
                            </p>
                            <button
                                onClick={() => navigate("/login?role=WARDEN")}
                                className="inline-flex items-center justify-center w-full h-10 rounded-lg bg-slate-50 text-indigo-600 font-bold text-sm border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all"
                            >
                                Login as Warden
                            </button>
                        </div>

                        {/* Admin */}
                        <div className="group bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 p-6 transition-all duration-300 hover:-translate-y-1">
                            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Admin Login</h3>
                            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                                System configuration, fee structure management, global reports,
                                and staff management.
                            </p>
                            <button
                                onClick={() => navigate("/login?role=ADMIN")}
                                className="inline-flex items-center justify-center w-full h-10 rounded-lg bg-slate-50 text-emerald-600 font-bold text-sm border border-slate-200 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all"
                            >
                                Login as Admin
                            </button>
                        </div>
                    </div>
                </section>

                {/* ---- ABOUT + FACILITIES ---- */}
                <section id="about" className="py-12 bg-white border-y border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                            {/* Left: About */}
                            <div className="lg:w-1/2 flex flex-col justify-start">
                                <div className="inline-block text-blue-600 font-bold text-sm tracking-widest uppercase mb-2">
                                    About Us
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
                                    Excellence in Hospitality &amp; Student Care
                                </h2>
                                <div className="space-y-4 text-slate-600 text-lg leading-relaxed mb-8">
                                    <p>
                                        MITS Hostels provide a residential environment that
                                        encourages the holistic development of students. Our hostels
                                        are more than just a place to stay; they are vibrant
                                        communities where students learn to live together, share
                                        experiences, and build lifelong friendships.
                                    </p>
                                    <p>
                                        Located within the lush green campus of MITS Gwalior, we
                                        offer separate accommodation for boys and girls with 24/7
                                        security, modern amenities, and a disciplined yet friendly
                                        atmosphere.
                                    </p>
                                </div>
                            </div>

                            {/* Right: Facilities */}
                            <div id="facilities" className="lg:w-1/2">
                                <h3 className="text-xl font-bold text-slate-900 mb-6">Premium Facilities</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { icon: "wifi", title: "High-Speed Wi-Fi", desc: "Seamless connectivity across all hostel blocks and common areas." },
                                        { icon: "restaurant", title: "Hygienic Mess", desc: "Nutritious and balanced meals served 4 times a day in clean dining halls." },
                                        { icon: "local_laundry_service", title: "Laundry Service", desc: "In-house laundry facilities available for all residents." },
                                        { icon: "sports_basketball", title: "Sports Complex", desc: "Access to indoor games room, badminton courts, and gym." },
                                        { icon: "security", title: "24x7 Security", desc: "CCTV surveillance and round-the-clock security guards." },
                                        { icon: "medical_services", title: "Medical Aid", desc: "First aid facility and visiting doctor available on campus." },
                                    ].map((f) => (
                                        <div
                                            key={f.icon}
                                            className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
                                        >
                                            <div className="shrink-0 w-10 h-10 rounded-full bg-white text-blue-600 shadow-sm flex items-center justify-center border border-slate-100">
                                                <span className="material-symbols-outlined">{f.icon}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{f.title}</h4>
                                                <p className="text-sm text-slate-500 mt-1">{f.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* ==================== FOOTER ==================== */}
            <footer id="contact" className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                        {/* Brand */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-white text-3xl">school</span>
                                <h2 className="text-white text-xl font-bold">MITS Gwalior</h2>
                            </div>
                            <p className="text-sm mb-4">
                                {s.footer_brand_text || "Madhav Institute of Technology & Science, Race Course Road, Gwalior, M.P. - 474005"}
                            </p>
                            <div className="flex gap-4">
                                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                                    <span className="material-symbols-outlined">social_leaderboard</span>
                                </span>
                                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                                    <span className="material-symbols-outlined">public</span>
                                </span>
                                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                                    <span className="material-symbols-outlined">videocam</span>
                                </span>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Quick Links</h3>
                            <ul className="space-y-2 text-sm">
                                <li><a className="hover:text-blue-400 transition-colors" href="https://web.mitsgwalior.in/">Main Website</a></li>
                                <li><a className="hover:text-blue-400 transition-colors" href="#">Fee Structure</a></li>


                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Contact Us</h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-blue-400 text-lg">call</span>
                                    <span>{s.contact_phone_footer || "+91-751-2409300"}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-blue-400 text-lg">mail</span>
                                    <span>{s.contact_email_footer || "hostel@mitsgwalior.in"}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-blue-400 text-lg">location_on</span>
                                    <a
                                        href="https://maps.app.goo.gl/HHzT6ehYukgN76PL8"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-blue-400 transition-colors underline underline-offset-2"
                                    >
                                        {s.college_address || "Race Course Road, Gwalior Police Line Area, Gwalior, MP-474002, India"}
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Map */}
                        <div>
                            <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Location</h3>
                            <a
                                href="https://maps.app.goo.gl/HHzT6ehYukgN76PL8"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block rounded-lg overflow-hidden h-32 w-full bg-slate-800"
                            >
                                <img
                                    alt="Map location of MITS Gwalior"
                                    className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                                    src="/locationSS.png"
                                />
                            </a>
                        </div>
                    </div>

                    {/* Bottom */}
                    <div className="pt-8 border-t border-slate-800 text-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
                        <p>{s.copyright_text || "© 2026 MITS Hostel Management System. All rights reserved."}</p>
                        <div className="flex gap-6">
                            <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
                            <a className="hover:text-white transition-colors" href="#">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
