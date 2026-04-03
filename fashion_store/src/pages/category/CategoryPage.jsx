import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import ProductCard from '../../components/product/ProductCard';
import { FunnelIcon, ChevronDownIcon, CheckIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

// Banner images per category
const BANNER = {
    men: 'https://images.pexels.com/photos/5840461/pexels-photo-5840461.jpeg',
    women: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80',
    children: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=1400&q=80',
};

// Tune per-photo so the subject's face is never cropped
const BANNER_POSITION = {
    men: 'center top',
    women: 'center 20%',
    children: 'center 20%',
};

const SUBCATEGORIES = {
    men: ['All', 'Shirts', 'T-Shirts', 'Pants', 'Shoes', 'Accessories'],
    women: ['All', 'Dresses', 'Tops', 'Jeans', 'Shoes', 'Accessories'],
    children: ['All', 'Boys', 'Girls', 'Baby', 'Shoes'],
};

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
];

const CategoryPage = () => {
    const { gender } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    const subcategory = searchParams.get('sub') || 'all';
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1', 10);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ gender, sort, page, limit: 12 });
                if (subcategory && subcategory !== 'all') params.set('subcategory', subcategory.toLowerCase());
                const { data } = await api.get(`/products?${params}`);
                setProducts(data.products);
                setTotal(data.total);
                setPages(data.pages);
            } catch { }
            finally { setLoading(false); }
        };
        fetchProducts();
    }, [gender, subcategory, sort, page]);

    const setFilter = (key, value) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set(key, value);
            if (key !== 'page') next.set('page', '1');
            return next;
        });
    };

    const handleAddToCart = async (product) => {
        const defaultSize = product.sizes?.[0]?.size || 'M';
        const result = await addToCart(product._id, defaultSize, 1);
        if (result?.success) toast.success(`${product.name} added to bag!`);
        else toast.error(result?.message || 'Failed to add to bag');
    };

    const label = gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : '';
    const subs = SUBCATEGORIES[gender] || ['All'];
    const currentSortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label || 'Sort';
    const [sortOpen, setSortOpen] = useState(false);
    const sortRef = useRef(null);

    // Close sort dropdown on outside click
    useEffect(() => {
        const handler = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a]">

            {/* ── Category Banner ── */}
            <div className="relative w-full overflow-hidden" style={{ height: '420px' }}>
                <img
                    src={BANNER[gender] || BANNER.women}
                    alt={label}
                    className="absolute inset-0 w-full h-full object-cover scale-105"
                    style={{ objectPosition: BANNER_POSITION[gender] || 'center 20%' }}
                />
                {/* Bottom-up gradient — photo fully visible at top, text readable at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/95 via-[#1a1a1a]/60 to-transparent" />

                {/* Text anchored to bottom */}
                <div className="absolute bottom-0 left-0 right-0 px-8 sm:px-16 pb-10">
                    <p className="text-xs tracking-[0.2em] uppercase text-[#D4A574] mb-3 font-semibold">Collection</p>
                    <h1
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-4xl sm:text-6xl font-bold text-white leading-tight"
                    >
                        {label}&apos;s Fashion
                    </h1>
                    <p className="text-[#E8D5C4] text-sm mt-3 tracking-wide font-light">{total} products available</p>
                </div>
            </div>

            {/* ─── Filters Bar ─────────────────────────────────────────── */}
            <div className="border-b border-[#D4A574]/20 bg-gradient-to-b from-[#2d2d2d] to-[#1a1a1a] sticky top-16 z-30 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4 py-4">

                    {/* Subcategory pills — bigger + readable */}
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-1">
                        {subs.map((sub) => {
                            // Keep hyphens because the backend/product seed uses values like `t-shirts`.
                            // (e.g. `T-Shirts` -> `t-shirts`)
                            const val = sub.toLowerCase();
                            const isActive = subcategory === val || (val === 'all' && (subcategory === 'all' || !subcategory));
                            return (
                                <button
                                    key={sub}
                                    onClick={() => setFilter('sub', val)}
                                    className={`flex-none text-sm font-medium px-5 py-2.5 whitespace-nowrap rounded-full transition-all duration-300 ${isActive
                                        ? 'bg-[#D4A574] text-[#1a1a1a] shadow-lg'
                                        : 'bg-[#2d2d2d] text-[#D4D4D4] border border-[#D4A574]/30 hover:border-[#D4A574] hover:text-white'
                                        }`}
                                >
                                    {sub}
                                </button>
                            );
                        })}
                    </div>

                    {/* Sort — custom floating dropdown */}
                    <div className="relative flex-shrink-0" ref={sortRef}>
                        <button
                            onClick={() => setSortOpen(!sortOpen)}
                            className="flex items-center gap-2 text-sm font-medium text-[#D4D4D4] border border-[#D4A574]/30 px-4 py-2.5 rounded-lg hover:border-[#D4A574] hover:text-white transition-colors bg-[#2d2d2d]"
                        >
                            <span>{currentSortLabel}</span>
                            <ChevronDownIcon className={`h-4 w-4 text-[#D4A574] transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {sortOpen && (
                            <div className="absolute right-0 top-full mt-2 w-52 bg-[#2d2d2d] border border-[#D4A574]/30 shadow-2xl rounded-xl overflow-hidden z-50">
                                {SORT_OPTIONS.map((o) => (
                                    <button
                                        key={o.value}
                                        onClick={() => { setFilter('sort', o.value); setSortOpen(false); }}
                                        className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors ${sort === o.value
                                            ? 'bg-[#D4A574]/20 text-[#D4A574] font-semibold'
                                            : 'text-[#D4D4D4] hover:bg-[#3d3d3d] hover:text-white'
                                            }`}
                                    >
                                        {o.label}
                                        {sort === o.value && <CheckIcon className="h-4 w-4 text-[#D4A574]" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>


            {/* ── Product Grid ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">

                {/* Results count */}
                <div className="flex items-center gap-2 mb-8">
                    <FunnelIcon className="h-3.5 w-3.5 text-[#D4A574]" />
                    <span className="text-[0.75rem] tracking-[0.1em] uppercase text-[#D4D4D4] font-semibold">
                        {total} Result{total !== 1 ? 's' : ''}
                    </span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="animate-pulse rounded-xl overflow-hidden">
                                <div className="aspect-[3/4] bg-gradient-to-br from-[#3d3d3d] to-[#2d2d2d] rounded-xl" />
                                <div className="mt-4 space-y-3">
                                    <div className="h-3 bg-[#3d3d3d] rounded-lg w-1/2" />
                                    <div className="h-4 bg-[#3d3d3d] rounded-lg w-3/4" />
                                    <div className="h-3 bg-[#3d3d3d] rounded-lg w-2/5" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((p, idx) => (
                            <div 
                                key={p._id}
                                className="opacity-0 animate-fade-in"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <ProductCard product={p} onAddToCart={handleAddToCart} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 border-2 border-[#D4A574]/30 rounded-3xl bg-[#2d2d2d]/50">
                        <div className="flex justify-center mb-8">
                            <div className="w-16 h-16 border-2 border-[#D4A574]/30 rounded-full flex items-center justify-center bg-[#3d3d3d]">
                                <ShoppingBagIcon className="h-7 w-7 text-[#D4A574]" />
                            </div>
                        </div>
                        <h3
                            style={{ fontFamily: "'Playfair Display', serif" }}
                            className="text-2xl font-bold text-white mb-3"
                        >
                            No products found
                        </h3>
                        <p className="text-[#D4D4D4] text-sm">Try a different category or check back later.</p>
                    </div>
                )}

                {/* ── Pagination ── */}
                {pages > 1 && (
                    <div className="flex justify-center gap-3 mt-16">
                        {[...Array(pages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setFilter('page', String(i + 1))}
                                className={`w-10 h-10 text-sm font-medium transition-all border rounded-full ${page === i + 1
                                        ? 'bg-[#D4A574] text-[#1a1a1a] border-[#D4A574] shadow-lg'
                                        : 'bg-[#2d2d2d] text-[#D4D4D4] border-[#D4A574]/30 hover:border-[#D4A574] hover:text-white hover:shadow-md'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
