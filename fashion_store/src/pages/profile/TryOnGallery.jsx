import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, TrashIcon, PhotoIcon, SparklesIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TryOnGallery = () => {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/ai/tryon-history?limit=100');
            setItems(Array.isArray(data) ? data : []);
        } catch (e) {
            console.warn(e);
            toast.error(e.response?.data?.message || 'Could not load try-on history');
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this try-on from your gallery?')) return;
        try {
            await api.delete(`/ai/tryon-history/${id}`);
            setItems((prev) => prev.filter((x) => x._id !== id));
            toast.success('Removed from gallery');
        } catch (e) {
            toast.error(e.response?.data?.message || 'Could not delete');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center pt-16">
            <LoadingSpinner size="lg" text="Loading gallery…" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] pt-20 pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
                <div className="flex items-start justify-between gap-4 mb-8">
                    <div>
                        <p className="text-[0.65rem] uppercase tracking-[0.18em] font-semibold text-[#D4A574] mb-1">My Account</p>
                        <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl font-bold text-white">
                            Try-On Gallery
                        </h1>
                        <p className="text-[#D4D4D4] text-sm mt-1">
                            Saved AI try-ons you generated earlier.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={load}
                            className="inline-flex items-center gap-2 border-2 border-[#D4A574]/30 text-[#D4D4D4] text-xs font-semibold px-5 py-2.5 rounded-full hover:border-[#D4A574] hover:text-white transition-all bg-[#2d2d2d]"
                        >
                            Refresh
                        </button>
                        <Link
                            to="/profile"
                            className="inline-flex items-center gap-2 border-2 border-[#D4A574]/30 text-[#D4D4D4] text-xs font-semibold px-5 py-2.5 rounded-full hover:border-[#D4A574] hover:text-white transition-all bg-[#2d2d2d]"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            Back to Profile
                        </Link>
                    </div>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-20 bg-[#2d2d2d] border-2 border-[#D4A574]/20 rounded-2xl">
                        <div className="w-16 h-16 rounded-full border-2 border-[#D4A574]/30 bg-[#1a1a1a] flex items-center justify-center mx-auto mb-5">
                            <PhotoIcon className="h-7 w-7 text-[#D4A574]" />
                        </div>
                        <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold text-white mb-2">
                            No try-ons saved yet
                        </h2>
                        <p className="text-[#D4D4D4] text-sm mb-8">
                            Use AI Try-On on any product and it will appear here automatically.
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4A574] to-[#C59868] text-[#1a1a1a] text-sm font-semibold px-8 py-3 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300"
                        >
                            <SparklesIcon className="h-4 w-4" />
                            Browse products
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {items.map((it) => {
                            const title = it.productSnapshot?.name || 'Try-On';
                            const created = it.createdAt ? new Date(it.createdAt) : null;
                            const when = created ? created.toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

                            return (
                                <div key={it._id} className="bg-[#2d2d2d] border-2 border-[#D4A574]/20 rounded-2xl p-5">
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-white line-clamp-1">{title}</p>
                                            <p className="text-xs text-[#D4D4D4] mt-0.5">
                                                {when}
                                                {it.productSnapshot?.price ? ` · ₹${it.productSnapshot.price}` : ''}
                                            </p>
                                            {it.product ? (
                                                <Link
                                                    to={`/product/${it.product}`}
                                                    className="text-xs text-[#D4A574] font-semibold hover:text-white transition-colors duration-300 inline-block mt-1"
                                                >
                                                    View product →
                                                </Link>
                                            ) : null}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(it._id)}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border-2 border-[#D4A574]/30 text-[#D4D4D4] hover:border-rose-400 hover:text-rose-300 transition-colors duration-300"
                                            title="Delete"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                            Delete
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {(it.images || []).map((img, idx) => (
                                            <a
                                                key={`${it._id}-${idx}`}
                                                href={img.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="group rounded-xl border-2 border-[#D4A574]/20 overflow-hidden bg-[#0d0d0d] hover:border-[#D4A574] transition-all duration-300"
                                                title="Open full image"
                                            >
                                                <div className="aspect-[3/4] overflow-hidden">
                                                    <img
                                                        src={img.url}
                                                        alt={img.pose ? `${title} — ${img.pose}` : title}
                                                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                                                        loading="lazy"
                                                    />
                                                </div>
                                                {img.pose ? (
                                                    <div className="px-3 py-2 bg-[#1a1a1a]">
                                                        <p className="text-[11px] text-[#D4D4D4] font-semibold line-clamp-1">{img.pose}</p>
                                                    </div>
                                                ) : null}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TryOnGallery;

