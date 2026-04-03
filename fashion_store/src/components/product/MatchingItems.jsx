import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

const MatchingItems = ({ productId }) => {
    const [items, setItems] = useState([]);
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    useEffect(() => {
        if (!productId) return;
        api.get(`/ai/matching-items/${productId}`)
            .then(({ data }) => setItems(data))
            .catch(() => { });
    }, [productId]);

    // Check scroll state
    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 8);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        checkScroll();
        el.addEventListener('scroll', checkScroll);
        window.addEventListener('resize', checkScroll);
        return () => {
            el.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [items]);

    const scroll = (dir) => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: dir === 'right' ? 220 : -220, behavior: 'smooth' });
    };

    if (items.length === 0) return null;

    return (
        <section>
            {/* ── Section header ── */}
            <div className="flex items-end justify-between mb-8 pb-6 border-b border-white/10 ">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <SparklesIcon className="h-4 w-4 text-[#D4A574]" />
                        <span className="text-xs uppercase tracking-[0.15em] font-medium text-[#D4A574]">
                            AI Curated
                        </span>
                    </div>
                    <h3
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-3xl sm:text-4xl font-bold text-white"
                    >
                        Complete the Look
                    </h3>
                </div>

                {/* Scroll arrow buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${canScrollLeft
                                ? 'border-[#D4A574]/50 text-[#D4A574] hover:bg-white/10'
                                : 'border-white/10 text-white/30 cursor-default'
                            }`}
                    >
                        <ChevronLeftIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${canScrollRight
                                ? 'border-[#D4A574]/50 text-[#D4A574] hover:bg-white/10'
                                : 'border-white/10 text-white/30 cursor-default'
                            }`}
                    >
                        <ChevronRightIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* ── Horizontal scroll strip ── */}
            <div
                ref={scrollRef}
                className="flex gap-5 overflow-x-auto pb-3 scrollbar-none -mx-1 px-1"
            >
                {items.map((item, index) => {
                    const img = item.images?.find((i) => i.isMain)?.url || item.images?.[0]?.url;
                    const originalPrice = item.originalPrice;
                    const discount = originalPrice
                        ? Math.round(((originalPrice - item.price) / originalPrice) * 100)
                        : 0;

                    return (
                        <Link
                            key={item._id}
                            to={`/product/${item._id}`}
                            className="group flex-none w-44 sm:w-48"
                        >
                            {/* Image — rounded corners */}
                            <div className="relative overflow-hidden bg-[#1a1a1a] aspect-[3/4] mb-3 rounded-xl">
                                <img
                                    src={img || 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400'}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                                {/* Numbered tag */}
                                <span className="absolute top-2 left-2 w-6 h-6 bg-black/30 rounded-full flex items-center justify-center text-[0.6rem] font-bold text-white">
                                    {index + 1}
                                </span>
                                {/* Discount tag */}
                                {discount > 0 && (
                                    <span className="absolute top-2 right-2 bg-[#D4A574] text-[#1a1a1a] text-[0.6rem] px-2 py-0.5 font-semibold rounded">
                                        -{discount}%
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div>
                                <p className="text-[0.7rem] uppercase tracking-wide text-[#D4D4D4]/60 mb-1 font-medium">
                                    {item.brand || item.subcategory}
                                </p>
                                <p className="text-sm font-medium text-white line-clamp-2 leading-snug group-hover:text-[#D4A574] transition-colors mb-2">
                                    {item.name}
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-bold text-white">
                                        ₹{item.price?.toLocaleString()}
                                    </span>
                                    {originalPrice && (
                                        <span className="text-xs text-[#D4D4D4]/60 line-through">
                                            ₹{originalPrice.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};

export default MatchingItems;
