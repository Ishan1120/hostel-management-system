import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const API_BASE = "http://localhost:5000";

export default function Gallery() {
    const navigate = useNavigate();
    const [mainImages, setMainImages] = useState([]);
    const [boysImages, setBoysImages] = useState([]);
    const [girlsImages, setGirlsImages] = useState([]);
    const [activeTab, setActiveTab] = useState("main");
    const [currentSlide, setCurrentSlide] = useState(0);
    const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });
    const [loading, setLoading] = useState(true);
    const slideInterval = useRef(null);

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        setLoading(true);
        try {
            const [main, boys, girls] = await Promise.all([
                api.get("/public/gallery?category=main"),
                api.get("/public/gallery?category=boys"),
                api.get("/public/gallery?category=girls"),
            ]);
            setMainImages(main.data);
            setBoysImages(boys.data);
            setGirlsImages(girls.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Active images based on tab
    const activeImages = activeTab === "main" ? mainImages : activeTab === "boys" ? boysImages : girlsImages;

    // Auto slideshow for main carousel
    const slideshowImages = mainImages;

    const nextSlide = useCallback(() => {
        if (slideshowImages.length === 0) return;
        setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
    }, [slideshowImages.length]);

    const prevSlide = useCallback(() => {
        if (slideshowImages.length === 0) return;
        setCurrentSlide((prev) => (prev - 1 + slideshowImages.length) % slideshowImages.length);
    }, [slideshowImages.length]);

    useEffect(() => {
        if (slideshowImages.length <= 1) return;
        slideInterval.current = setInterval(nextSlide, 4000);
        return () => clearInterval(slideInterval.current);
    }, [slideshowImages.length, nextSlide]);

    const pauseAutoSlide = () => clearInterval(slideInterval.current);
    const resumeAutoSlide = () => {
        if (slideshowImages.length <= 1) return;
        slideInterval.current = setInterval(nextSlide, 4000);
    };

    const openLightbox = (images, index) => {
        setLightbox({ open: true, images, index });
    };

    const closeLightbox = () => setLightbox({ open: false, images: [], index: 0 });

    const lightboxNext = () => {
        setLightbox((prev) => ({ ...prev, index: (prev.index + 1) % prev.images.length }));
    };
    const lightboxPrev = () => {
        setLightbox((prev) => ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length }));
    };

    // Keyboard nav for lightbox
    useEffect(() => {
        if (!lightbox.open) return;
        const handler = (e) => {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") lightboxNext();
            if (e.key === "ArrowLeft") lightboxPrev();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [lightbox.open]);

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            {/* ===== HEADER ===== */}
            <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <span className="material-symbols-outlined text-lg group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                        <span className="text-sm font-medium">Back to Home</span>
                    </button>
                    <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Hostel Gallery
                    </h1>
                    <div className="w-24" />
                </div>
            </header>

            {/* ===== HERO SLIDESHOW ===== */}
            <section className="relative w-full overflow-hidden" style={{ height: "520px" }}>
                {slideshowImages.length > 0 ? (
                    <div
                        className="relative w-full h-full"
                        onMouseEnter={pauseAutoSlide}
                        onMouseLeave={resumeAutoSlide}
                    >
                        {/* Slides */}
                        {slideshowImages.map((img, i) => (
                            <div
                                key={img.id}
                                className="absolute inset-0 transition-all duration-700 ease-in-out"
                                style={{
                                    opacity: i === currentSlide ? 1 : 0,
                                    transform: i === currentSlide ? "scale(1)" : "scale(1.05)",
                                    zIndex: i === currentSlide ? 1 : 0,
                                }}
                            >
                                <img
                                    src={`${API_BASE}${img.image_path}`}
                                    alt={img.caption || "Hostel"}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                            </div>
                        ))}

                        {/* Caption overlay */}
                        {slideshowImages[currentSlide]?.caption && (
                            <div className="absolute bottom-24 left-0 right-0 z-10 text-center">
                                <p className="text-xl md:text-2xl font-light text-white/90 tracking-wide px-4">
                                    {slideshowImages[currentSlide].caption}
                                </p>
                            </div>
                        )}

                        {/* Nav arrows */}
                        {slideshowImages.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md flex items-center justify-center transition-all border border-white/10 hover:border-white/30"
                                >
                                    <span className="material-symbols-outlined text-white">chevron_left</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md flex items-center justify-center transition-all border border-white/10 hover:border-white/30"
                                >
                                    <span className="material-symbols-outlined text-white">chevron_right</span>
                                </button>
                            </>
                        )}

                        {/* Dots */}
                        {slideshowImages.length > 1 && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                                {slideshowImages.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentSlide(i)}
                                        className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide
                                            ? "w-8 bg-blue-400"
                                            : "w-2 bg-white/40 hover:bg-white/60"
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                        <span className="material-symbols-outlined text-7xl text-slate-700 mb-4">photo_library</span>
                        <p className="text-slate-500 text-lg font-medium">
                            {loading ? "Loading gallery..." : "No slideshow images yet"}
                        </p>
                        <p className="text-slate-600 text-sm mt-1">
                            {loading ? "" : "Check back later for hostel photos"}
                        </p>
                    </div>
                )}
            </section>

            {/* ===== TAB SECTION ===== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Section Header */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
                        Explore Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Hostels</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Browse through our accommodation facilities for boys and girls
                    </p>
                </div>

                {/* Tab Buttons */}
                <div className="flex justify-center gap-3 mb-10">
                    {[
                        { key: "boys", label: "Boys Hostel", icon: "male", color: "blue" },
                        { key: "girls", label: "Girls Hostel", icon: "female", color: "pink" },
                    ].map((tab) => {
                        const isActive = activeTab === tab.key;
                        const colorMap = {
                            blue: isActive
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 border-blue-500"
                                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 border-slate-700 hover:border-slate-600",
                            pink: isActive
                                ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30 border-pink-500"
                                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 border-slate-700 hover:border-slate-600",
                        };
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 border ${colorMap[tab.color]}`}
                            >
                                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Image Grid */}
                {activeImages.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {activeImages.map((img, idx) => (
                            <div
                                key={img.id}
                                onClick={() => openLightbox(activeImages, idx)}
                                className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-[4/3] bg-slate-800"
                            >
                                <img
                                    src={`${API_BASE}${img.image_path}`}
                                    alt={img.caption || "Hostel"}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    loading="lazy"
                                />
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                {/* Caption */}
                                {img.caption && (
                                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <p className="text-white font-semibold text-sm">{img.caption}</p>
                                    </div>
                                )}
                                {/* Zoom Icon */}
                                <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/20">
                                    <span className="material-symbols-outlined text-white text-sm">zoom_in</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                        <span className="material-symbols-outlined text-6xl text-slate-700 mb-3">
                            {activeTab === "boys" ? "male" : "female"}
                        </span>
                        <p className="text-slate-500 text-lg font-medium">
                            {loading ? "Loading..." : `No ${activeTab === "boys" ? "Boys" : "Girls"} Hostel images yet`}
                        </p>
                        <p className="text-slate-600 text-sm mt-1">Photos will appear here once uploaded by admin</p>
                    </div>
                )}
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="border-t border-slate-800/50 bg-slate-900/50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} MITS Hostel Management System
                    </p>
                </div>
            </footer>

            {/* ===== LIGHTBOX ===== */}
            {lightbox.open && lightbox.images.length > 0 && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center"
                    onClick={closeLightbox}
                >
                    {/* Close */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                        <span className="material-symbols-outlined text-white">close</span>
                    </button>

                    {/* Counter */}
                    <div className="absolute top-5 left-5 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium backdrop-blur-md">
                        {lightbox.index + 1} / {lightbox.images.length}
                    </div>

                    {/* Image */}
                    <div className="max-w-5xl max-h-[85vh] px-16" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={`${API_BASE}${lightbox.images[lightbox.index].image_path}`}
                            alt={lightbox.images[lightbox.index].caption || ""}
                            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                        />
                        {lightbox.images[lightbox.index].caption && (
                            <p className="text-center text-white/80 font-medium mt-4 text-lg">
                                {lightbox.images[lightbox.index].caption}
                            </p>
                        )}
                    </div>

                    {/* Nav */}
                    {lightbox.images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
                            >
                                <span className="material-symbols-outlined text-white text-2xl">chevron_left</span>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
                            >
                                <span className="material-symbols-outlined text-white text-2xl">chevron_right</span>
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
