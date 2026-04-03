import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, SparklesIcon, ShieldCheckIcon, TruckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ProductCard from '../components/product/ProductCard';
import { useCart } from '../context/CartContext';

// ─── Static image constants ──────────────────────────────────────────────────
const HERO_VIDEO = 'https://videos.pexels.com/video-files/7974881/7974881-hd_1920_1080_30fps.mp4';
const HERO_IMAGE = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1400&q=80';
const HERO_SECONDARY = 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80';
const AI_BANNER_IMAGE = 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1400&q=80';

const CATEGORIES = [
    {
        gender: 'men',
        label: 'Men',
        sub: 'Shirts, Trousers & More',
        image: 'https://images.pexels.com/photos/28400613/pexels-photo-28400613.jpeg',
        to: '/men',
    },
    {
        gender: 'women',
        label: 'Women',
        sub: 'Dresses, Tops & More',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80',
        to: '/women',
    },
    {
        gender: 'children',
        label: 'Children',
        sub: 'Boys, Girls & Baby',
        image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=900&q=80',
        to: '/children',
    },
];

const PERKS = [
    { icon: SparklesIcon, title: 'AI Try-On', desc: 'See clothes on you before buying' },
    { icon: ShieldCheckIcon, title: 'Secure Checkout', desc: 'SSL-encrypted payments' },
    { icon: TruckIcon, title: 'Free Delivery', desc: 'On orders above ₹999' },
];

const Home = () => {
    const { addToCart } = useCart();
    const [featured, setFeatured] = useState([]);
    const [loadingFeatured, setLoadingFeatured] = useState(true);

    const featuredParams = useMemo(
        () => new URLSearchParams({ sort: 'rating', page: '1', limit: '8' }).toString(),
        []
    );

    useEffect(() => {
        let alive = true;

        const fetchFeatured = async () => {
            setLoadingFeatured(true);
            try {
                const { data } = await api.get(`/products?${featuredParams}`);
                if (!alive) return;
                setFeatured(Array.isArray(data?.products) ? data.products : []);
            } catch {
                if (!alive) return;
                setFeatured([]);
            } finally {
                if (!alive) return;
                setLoadingFeatured(false);
            }
        };

        fetchFeatured();
        return () => { alive = false; };
    }, [featuredParams]);

    const handleAddToCart = async (product) => {
        const defaultSize = product.sizes?.[0]?.size || 'M';
        const result = await addToCart(product._id, defaultSize, 1);
        if (result?.success) toast.success(`${product.name} added to bag!`);
        else toast.error(result?.message || 'Failed to add to bag');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a]">

            {/* ─── HERO ──────────────────────────────────────────────────── */}
            <section className="relative pt-28 pb-20 overflow-hidden bg-black">
                {/* Video Background */}
                <div className="absolute inset-0 w-full h-full">
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                    >
                        <source src="../public/intro.mp4 "type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    {/* Dark overlay on video */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a]/60 to-[#1a1a1a]/40" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a]/30 via-transparent to-[#1a1a1a]/50" />
                </div>

                {/* Animated gradient orbs */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-20 -right-40 w-80 h-80 bg-[#B8956A] rounded-full blur-3xl opacity-20" />
                    <div className="absolute bottom-0 -left-40 w-72 h-72 bg-[#C59868] rounded-full blur-3xl opacity-20" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 relative z-10">
                    <div className="grid lg:grid-cols-12 gap-16 items-center min-h-[600px]">
                        {/* Copy */}
                        <div className="lg:col-span-6 space-y-8">
                            <div className="inline-block">
                                <p className="text-xs tracking-[0.2em] uppercase text-[#D4A574] mb-2 animate-fade-in font-semibold">New Season — 2026</p>
                                <div className="h-0.5 w-12 bg-gradient-to-r from-[#D4A574] to-transparent" />
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-6xl sm:text-7xl font-bold text-white leading-tight animate-slide-up" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Fashion <span className="text-[#D4A574] italic font-light">Meets</span> <br /> Intelligence
                                </h1>
                            </div>

                            <p className="text-lg text-[#E8D5C4] leading-relaxed max-w-lg animate-slide-up animation-delay-200 font-light">
                                Discover the future of fashion. AI-powered styling, virtual try-ons, and smarter choices—all designed for your unique style and body.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <Link to="/women" className="group relative inline-flex items-center gap-2 px-8 py-3.5 bg-[#D4A574] text-[#1a1a1a] rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 animate-slide-up animation-delay-300">
                                    <span className="absolute inset-0 bg-gradient-to-r from-[#D4A574] to-[#C59868] -z-10" />
                                    Shop Women <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link to="/men" className="group relative inline-flex items-center gap-2 px-8 py-3.5 bg-white border-2 border-white text-[#1a1a1a] rounded-xl font-semibold transition-all duration-300 hover:bg-[#E8D5C4] hover:border-[#E8D5C4] animate-slide-up animation-delay-400">
                                    Shop Men <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link to="/profile" className="group relative inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#D4A574] to-[#C59868] text-[#1a1a1a] rounded-xl font-semibold transition-all duration-300 hover:shadow-2xl hover:scale-105 animate-slide-up animation-delay-500">
                                    <SparklesIcon className="h-4 w-4 group-hover:rotate-12 transition-transform" /> Get AI Try-On
                                </Link>
                            </div>

                            {/* Perks */}
                            <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {PERKS.map(({ icon: Icon, title, desc }, idx) => (
                                    <div key={title} className="group opacity-0 animate-fade-in" style={{ animationDelay: `${400 + idx * 150}ms` }}>
                                        <div className="relative p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:border-[#D4A574]/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col items-center text-center gap-4 h-56 justify-center">
                                            <div className="w-16 h-16 bg-gradient-to-br from-[#D4A574]/30 to-[#C59868]/20 border border-[#D4A574]/40 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                                                <Icon className="h-8 w-8 text-[#D4A574]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">{title}</p>
                                                <p className="text-xs text-[#D4D4D4] mt-2 leading-relaxed">{desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modern Premium Overlapping Images */}
                        <div className="lg:col-span-6">
                            <div className="relative w-full h-full min-h-96 flex items-center justify-end group perspective">
                                {/* Background Blur Effect */}
                                <div className="absolute inset-0 bg-gradient-to-l from-[#D4A574]/20 via-transparent to-transparent rounded-full blur-3xl group-hover:from-[#D4A574]/40 transition-all duration-700" />
                                
                                {/* First Card - Left Position */}
                                <div className="absolute left-0 top-8 z-20 w-80 h-96 group-hover:-translate-x-6 group-hover:-translate-y-4 transition-all duration-700 ease-out">
                                    <div className="absolute -inset-2 bg-gradient-to-br from-[#D4A574] via-[#C59868] to-[#B8956A] rounded-2xl opacity-30 group-hover:opacity-50 blur-2xl transition-opacity duration-700" />
                                    <div className="relative overflow-hidden rounded-2xl border border-[#D4A574] shadow-2xl bg-black/50 backdrop-blur-sm group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-700 h-full">
                                        <img
                                            src="https://images.unsplash.com/photo-1633276664217-2e5ecc6d386b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDF8fHxlbnwwfHx8fHw%3D"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                            <p className="text-xs tracking-widest uppercase text-[#D4A574] font-bold mb-2">Elegance</p>
                                            <p className="text-lg font-bold">Premium Collection</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Second Card - Right Position (Overlapping) */}
                                <div className="absolute right-0 bottom-4 z-30 w-80 h-96 group-hover:translate-x-6 group-hover:translate-y-4 transition-all duration-700 ease-out">
                                    <div className="absolute -inset-2 bg-gradient-to-br from-[#C59868] via-[#B8956A] to-[#A68354] rounded-2xl opacity-30 group-hover:opacity-50 blur-2xl transition-opacity duration-700" />
                                    <div className="relative overflow-hidden rounded-2xl border border-[#D4A574] shadow-2xl bg-black/50 backdrop-blur-sm group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-700 h-full">
                                        <img
                                            src="https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                            alt="Modern Fashion Piece"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                            <p className="text-xs tracking-widest uppercase text-[#D4A574] font-bold mb-2">Innovation</p>
                                            <p className="text-lg font-bold">Trending Now</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Accent Decorative Line */}
                                <div className="absolute top-0 left-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#D4A574] to-transparent group-hover:w-32 transition-all duration-700" />
                            </div>

                            <div className="mt-12 flex flex-wrap items-center gap-3 justify-center lg:justify-start">
                                {['Premium fabrics', 'Easy returns', 'Trusted reviews'].map((tag, idx) => (
                                    <span key={tag} className="inline-block px-4 py-2 rounded-full bg-white/10 border border-[#D4A574]/30 text-xs font-semibold text-[#D4A574] shadow-sm hover:shadow-md hover:border-[#D4A574] transition-all duration-300 opacity-0 animate-fade-in" style={{ animationDelay: `${600 + idx * 100}ms` }}>
                                        ✓ {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── CATEGORIES ────────────────────────────────────────────── */}
            <section className="py-32 px-4 mt-7 sm:px-8 lg:px-16 max-w-7xl mx-auto relative bg-gradient-to-b from-[#1a1a1a] to-[#2d2d2d]">
                <div className="absolute -top-20 right-0 w-96 h-96 bg-[#D4A574] rounded-full blur-3xl opacity-10" />
                
                <div className="flex items-end justify-between mb-16 relative z-10">
                    <div>
                        <p className="text-xs tracking-[0.2em] uppercase text-[#D4A574] mb-4 font-semibold">Curated For You</p>
                        <h2
                            style={{ fontFamily: "'Playfair Display', serif" }}
                            className="text-5xl sm:text-6xl font-bold text-white leading-tight"
                        >
                            Shop by Category
                        </h2>
                    </div>
                    <Link to="/women" className="hidden sm:flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-[#D4A574] hover:text-white transition-colors duration-300 font-semibold group">
                        View All <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {CATEGORIES.map((cat, idx) => (
                        <Link
                            key={cat.gender}
                            to={cat.to}
                            className="group relative overflow-hidden rounded-3xl border-2 border-[#D4A574]/30 bg-[#2d2d2d] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 opacity-0 animate-slide-up"
                            style={{ animationDelay: `${idx * 150}ms` }}
                        >
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D4A574] to-[#C59868] opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-500" />
                            
                            <div className="aspect-[4/5] sm:aspect-[3/4] relative overflow-hidden">
                                <img
                                    src={cat.image}
                                    alt={cat.label}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a1a1a]/30 to-[#1a1a1a]/80 group-hover:via-[#1a1a1a]/50 group-hover:to-[#1a1a1a]/90 transition-all duration-500" />
                            </div>

                            {/* Label */}
                            <div className="absolute inset-0 flex flex-col justify-end p-7 sm:p-8">
                                <p className="text-xs tracking-[0.1em] uppercase text-white/50 mb-2 font-semibold group-hover:text-white/80 transition-colors duration-300">{cat.sub}</p>
                                <h3
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                    className="text-4xl sm:text-5xl font-bold text-white mb-4 transform group-hover:scale-105 transition-transform duration-300 origin-left"
                                >
                                    {cat.label}
                                </h3>
                                <span className="flex items-center gap-2.5 text-xs tracking-[0.12em] uppercase text-[#D4A574] group-hover:text-white group-hover:gap-4 transition-all duration-300 font-semibold">
                                    Explore <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ─── FEATURED PRODUCTS ─────────────────────────────────────── */}
            <section className="pb-32 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto relative bg-gradient-to-b from-[#2d2d2d] to-[#1a1a1a]">
                <div className="absolute -bottom-40 left-0 w-96 h-96 bg-[#C59868] rounded-full blur-3xl opacity-10" />
                
                <div className="flex items-end justify-between mb-14 relative z-10">
                    <div>
                        <p className="text-xs tracking-[0.2em] uppercase text-[#D4A574] mb-4 font-semibold">Trending Now</p>
                        <h2 className="text-5xl sm:text-6xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Best Sellers</h2>
                        <p className="text-[#D4D4D4] text-base mt-4 max-w-2xl font-light leading-relaxed">
                            Top-rated picks our customers love right now.
                        </p>
                    </div>
                    <Link
                        to="/women"
                        className="hidden sm:flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-[#D4A574] hover:text-white transition-colors duration-300 font-semibold group"
                    >
                        Shop Collection <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {loadingFeatured ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="group animate-pulse">
                                <div className="aspect-[3/4] bg-gradient-to-br from-[#3d3d3d] to-[#2d2d2d] rounded-2xl mb-4" />
                                <div className="space-y-2.5">
                                    <div className="h-3 bg-[#3d3d3d] rounded-lg w-3/4" />
                                    <div className="h-4 bg-[#3d3d3d] rounded-lg w-full" />
                                    <div className="h-3 bg-[#3d3d3d] rounded-lg w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : featured.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {featured.map((p, idx) => (
                            <div 
                                key={p._id} 
                                className="opacity-0 animate-fade-in"
                                style={{ animationDelay: `${idx * 75}ms` }}
                            >
                                <ProductCard product={p} onAddToCart={handleAddToCart} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-[#D4A574]/30 rounded-3xl bg-[#2d2d2d]/50 backdrop-blur-sm">
                        <h3 className="text-2xl font-bold text-white">No featured products yet</h3>
                        <p className="text-[#D4D4D4] text-base mt-3">Add products and reviews to see best sellers here.</p>
                        <div className="mt-8 flex justify-center gap-4">
                            <Link to="/women" className="px-6 py-3 bg-[#D4A574] text-[#1a1a1a] rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">Browse Women</Link>
                            <Link to="/men" className="px-6 py-3 border-2 border-[#D4A574] text-[#D4A574] rounded-xl font-semibold hover:bg-[#D4A574] hover:text-[#1a1a1a] transition-all duration-300">Browse Men</Link>
                        </div>
                    </div>
                )}
            </section>



            {/* ─── AI BANNER ─────────────────────────────────────────────── */}
            <section className="px-4 sm:px-8 mt-7 lg:px-16 pb-32 max-w-7xl mx-auto">
                <div className="group relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-3xl border-2 border-[#D4A574]/30 shadow-2xl" style={{ minHeight: '480px' }}>
                    {/* Background image with sophisticated overlay */}
                    <img
                        src={AI_BANNER_IMAGE}
                        alt="AI Try-On feature"
                        className="absolute inset-0 w-full h-full object-cover opacity-15 group-hover:opacity-25 transition-opacity duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a]/85 to-transparent" />
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#D4A574] rounded-full blur-3xl opacity-15 group-hover:opacity-25 transition-opacity duration-500" />

                    <div className="relative px-8 sm:px-16 py-24 max-w-2xl z-10">
                        <div className="inline-block mb-6">
                            <p className="text-xs tracking-[0.2em] uppercase text-[#D4A574] font-semibold">AI-Powered Innovation</p>
                            <div className="h-0.5 w-8 bg-gradient-to-r from-[#D4A574] to-transparent mt-3" />
                        </div>
                        
                        <h2
                            style={{ fontFamily: "'Playfair Display', serif" }}
                            className="text-6xl sm:text-7xl font-bold text-white mb-6 leading-tight"
                        >
                            Try Before<br />You Buy
                        </h2>
                        
                        <p className="text-[#E8D5C4] text-lg leading-relaxed mb-10 font-light max-w-xl">
                            Our AI virtual try-on uses your photo to show you exactly how any outfit will look on your body — in seconds. No more guessing.
                        </p>
                        
                        <Link to="/register" className="group/btn relative inline-flex items-center gap-3 px-9 py-4 bg-gradient-to-r from-[#D4A574] to-[#C59868] text-[#1a1a1a] rounded-xl font-bold overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-1">
                            <span className="absolute inset-0 bg-white/30 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                            <span className="relative flex items-center gap-2">
                                Get Started Now <ArrowRightIcon className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                            </span>
                        </Link>

                        <p className="text-[#D4D4D4]/60 text-xs mt-8 font-light">
                            ✨ Powered by advanced AI technology • Privacy guaranteed
                        </p>
                    </div>
                </div>
            </section>

            {/* ─── NEWSLETTER / FINAL CTA ───────────────────────────────── */}
            <section className="pb-24 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto relative ">
                <div className="absolute -top-80 right-0 w-96 h-96 bg-[#D4A574] rounded-full blur-3xl opacity-10" />
                
                <div className="grid lg:grid-cols-12 gap-8 items-stretch relative z-10">
                    {/* Newsletter Card */}
                    <div className="lg:col-span-7 relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D4A574]/30 to-[#C59868]/20 rounded-3xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500" />
                        
                        <div className="relative rounded-3xl p-10 sm:p-12 bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a] backdrop-blur-sm border-2 border-[#D4A574]/30 shadow-lg group-hover:shadow-xl transition-all duration-300">
                            <div className="inline-block mb-6">
                                <p className="text-xs tracking-[0.2em] uppercase text-[#D4A574] font-semibold">Members Only</p>
                                <div className="h-0.5 w-8 bg-gradient-to-r from-[#D4A574] to-transparent mt-3" />
                            </div>
                            
                            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Get outfit drops,<br />early access & AI picks.
                            </h2>
                            
                            <p className="text-[#D4D4D4] text-base mt-6 max-w-xl font-light leading-relaxed">
                                Join our exclusive list for new arrivals, limited collections, personalized style recommendations, and special member-only events.
                            </p>

                            <div className="mt-10 flex flex-col sm:flex-row gap-4">
                                <input 
                                    className="flex-1 px-6 py-4 rounded-xl bg-[#1a1a1a] border-2 border-[#D4A574]/30 text-white placeholder-[#8a8a8a] focus:outline-none focus:border-[#D4A574] focus:shadow-lg transition-all duration-300 font-light" 
                                    placeholder="Enter your email" 
                                    type="email" 
                                />
                                <button className="px-8 py-4 bg-[#D4A574] text-[#1a1a1a] rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-300" type="button">Notify Me</button>
                            </div>

                            <p className="text-xs text-[#D4D4D4]/60 mt-6 leading-relaxed font-light">
                                By subscribing, you agree to receive our newsletter. You can unsubscribe anytime. View our <span className="text-[#D4A574] font-semibold hover:text-white cursor-pointer">privacy policy</span>.
                            </p>
                        </div>
                    </div>

                    {/* Lookbook Card */}
                    <div className="lg:col-span-5 rounded-3xl overflow-hidden border-2 border-[#D4A574]/30 bg-[#1a1a1a] shadow-lg hover:shadow-xl transition-all duration-300 group relative">
                        <div className="absolute inset-0 -z-10">
                            <img
                                src="https://images.unsplash.com/photo-1561365452-adb940139ffa?q=80&w=1156&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                alt="Lookbook"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/60 to-transparent group-hover:via-[#1a1a1a]/80 transition-all duration-500" />
                        </div>
                        
                        <div className="relative p-10 sm:p-12 flex flex-col justify-end min-h-[360px]">
                             <div className="inline-block mb-6">
                                <p className="text-xs tracking-[0.2em] uppercase text-[#D4A574] font-semibold">Lookbook</p>
                                <div className="h-0.5 w-8 bg-gradient-to-r from-[#D4A574] to-transparent mt-3" />
                            </div>
                      
                            <h3 className="text-4xl sm:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Modern Essentials
                            </h3>
                            <p className="text-[#E8D5C4] text-base mb-8 max-w-sm leading-relaxed font-light">
                                Build your perfect capsule wardrobe with elevated staples and timeless pieces.
                            </p>
                            <Link to="/women" className="inline-flex items-center gap-3 text-[#D4A574] font-bold text-sm tracking-[0.1em] uppercase hover:text-white transition-colors duration-300 group/link">
                                Explore Now <ArrowRightIcon className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
