import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SizeRecommendation from '../components/product/SizeRecommendation';
import TryOnModal from '../components/product/TryOnModal';
import MatchingItems from '../components/product/MatchingItems';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { SparklesIcon, ShoppingBagIcon, StarIcon, CheckIcon } from '@heroicons/react/24/solid';
import { ArrowLeftIcon, TagIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState('');
    const [tryOnOpen, setTryOnOpen] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        api.get(`/products/${id}`)
            .then(({ data }) => {
                setProduct(data);
                if (data.sizes?.length > 0) setSelectedSize(data.sizes[0].size);
            })
            .catch(() => navigate(-1))
            .finally(() => setLoading(false));
    }, [id]);

    const handleAddToCart = async () => {
        if (!isAuthenticated) { navigate('/login'); return; }
        if (!selectedSize) { toast.error('Please select a size'); return; }
        setAddingToCart(true);
        const result = await addToCart(product._id, selectedSize, 1);
        setAddingToCart(false);
        if (result?.success) toast.success('Added to bag!');
        else toast.error(result?.message || 'Failed to add');
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] pt-16">
            <LoadingSpinner size="lg" text="Loading product..." />
        </div>
    );
    if (!product) return null;

    const mainImg = product.images?.[selectedImage]?.url || product.images?.[0]?.url;
    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] pt-20 pb-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-8">

                {/* ── Breadcrumb / Back ── */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-[#D4D4D4]/70 hover:text-white transition-colors"
                    >
                        <ArrowLeftIcon className="h-3.5 w-3.5" />
                        Back
                    </button>

                    {product.category && (
                        <span className="hidden sm:inline-flex items-center gap-2 text-[0.7rem] tracking-[0.18em] uppercase text-[#D4D4D4]/70">
                            {typeof product.category === 'string' ? product.category : product.category?.name}
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            {typeof product.subcategory === 'string' ? product.subcategory : product.subcategory?.name}
                        </span>
                    )}
                </div>

                {/* ── Main Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-10 xl:gap-16">

                    {/* ─── LEFT: Image Panel ─── */}
                    <div className="flex gap-4 animate-fade-up">

                        {/* Thumbnail column (shown when multiple images) */}
                        {product.images?.length > 1 && (
                            <div className="flex flex-col gap-2 w-18 flex-shrink-0">
                                {product.images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={`w-16 h-20 overflow-hidden rounded-xl border-2 transition-all duration-200 ${selectedImage === i
                                            ? 'border-[#D4A574] shadow-lg shadow-[#D4A574]/20'
                                            : 'border-white/10 opacity-60 hover:opacity-100 hover:shadow-sm'
                                            }`}
                                    >
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Main image */}
                        <div className="relative flex-1 overflow-hidden bg-[#1a1a1a] rounded-3xl shadow-xl group" style={{ aspectRatio: '3/4' }}>
                            <img
                                src={mainImg}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            />

                            {/* Discount badge */}
                            {discount > 0 && (
                                <span className="absolute top-4 left-4 bg-[#D4A574] text-[#1a1a1a] text-xs font-semibold px-2.5 py-1.5 tracking-[0.16em] rounded-full uppercase">
                                    -{discount}% Today
                                </span>
                            )}

                            {/* AI Try-On overlay button */}
                            {product.tryOnSupported && (
                                <button
                                    onClick={() => { if (!isAuthenticated) { navigate('/login'); return; } setTryOnOpen(true); }}
                                    className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-gradient-to-r from-[#D4A574] to-[#C59868] text-[#1a1a1a] text-[0.7rem] font-semibold px-3 py-2 rounded-full shadow-lg hover:shadow-lg hover:shadow-[#D4A574]/30 transition-all"
                                >
                                    <SparklesIcon className="h-3.5 w-3.5" />
                                    AI Try-On
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ─── RIGHT: Product Info ─── */}
                    <div className="flex flex-col gap-7 lg:sticky lg:top-28 self-start animate-fade-up">

                        {/* Brand + category tag */}
                        <div className="flex items-center gap-2">
                            {product.brand && (
                                <span className="text-xs uppercase tracking-[0.12em] font-semibold text-[#D4A574]">
                                    {product.brand}
                                </span>
                            )}
                            <span className="text-white/20">·</span>
                            <span className="text-xs uppercase tracking-[0.1em] text-[#D4D4D4]/70">
                                {product.subcategory}
                            </span>
                        </div>

                        {/* Product name */}
                        <div>
                            <h1
                                style={{ fontFamily: "'Playfair Display', serif" }}
                                className="text-3xl sm:text-4xl font-bold text-white leading-tight"
                            >
                                {product.name}
                            </h1>

                            {/* Rating row */}
                            {product.rating > 0 && (
                                <div className="flex items-center gap-2 mt-3">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <StarIcon
                                                key={i}
                                                className={`h-4 w-4 ${i < Math.round(product.rating) ? 'text-[#D4A574]' : 'text-white/20'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-[#D4D4D4]/70">
                                        {product.rating.toFixed(1)} ({product.numReviews} reviews)
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Price block */}
                        <div className="flex items-baseline gap-3 border-b border-white/10 pb-5">
                            <span className="text-3xl sm:text-4xl font-bold text-white">
                                ₹{product.price.toLocaleString()}
                            </span>
                            {product.originalPrice && (
                                <span className="text-lg text-[#D4D4D4]/70 line-through">
                                    ₹{product.originalPrice.toLocaleString()}
                                </span>
                            )}
                            {discount > 0 && (
                                <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded-full uppercase tracking-[0.14em]">
                                    {discount}% Off
                                </span>
                            )}
                        </div>

                        {/* Shipping / info row */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#D4D4D4]/70 -mt-2">
                            <span className="inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Delivery in 3–5 days
                            </span>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <span>Free returns within 14 days</span>
                        </div>

                        {/* AI Size Recommendation */}
                        <div className="rounded-2xl p-4">
                            <SizeRecommendation />
                        </div>

                        {/* Size selector */}
                        {product.sizes?.length > 0 && (
                            <div>
                                <p className="text-xs uppercase tracking-[0.1em] font-semibold text-white mb-3">
                                    Select Size
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes.map(({ size, stock }) => (
                                        <button
                                            key={size}
                                            onClick={() => stock > 0 && setSelectedSize(size)}
                                            disabled={stock === 0}
                                            className={`min-w-[52px] px-3 py-2 text-sm font-medium border rounded-lg transition-all ${selectedSize === size
                                                ? 'bg-gradient-to-r from-[#D4A574] to-[#C59868] border-[#D4A574] text-[#1a1a1a] font-bold'
                                                : stock === 0
                                                    ? 'border-white/10 text-[#D4D4D4]/50 cursor-not-allowed line-through'
                                                    : 'border-white/20 text-[#D4D4D4] hover:border-[#D4A574]/50 hover:text-[#D4A574]'
                                                }`}
                                        >
                                            {size}
                                            {stock === 0 && <span className="ml-1 text-xs">(OOS)</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CTA Buttons */}
                        <div className="flex flex-col gap-3 mt-2">
                            {/* Primary — Add to Bag */}
                            <button
                                onClick={handleAddToCart}
                                disabled={addingToCart}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4A574] to-[#C59868] text-[#1a1a1a] text-sm font-bold tracking-[0.14em] py-4 rounded-xl hover:shadow-lg hover:shadow-[#D4A574]/30 transition-all disabled:opacity-60 hover:scale-105"
                            >
                                {addingToCart
                                    ? <LoadingSpinner size="sm" />
                                    : <ShoppingBagIcon className="h-4 w-4" />
                                }
                                {addingToCart ? 'Adding…' : 'Add to Bag'}
                            </button>

                            {/* Secondary — AI Try-On (only if supported) */}
                            {product.tryOnSupported && (
                                <button
                                    onClick={() => { if (!isAuthenticated) { navigate('/login'); return; } setTryOnOpen(true); }}
                                    className="w-full flex items-center justify-center gap-2 border-2 border-[#D4A574]/30 text-[#D4D4D4] text-sm font-semibold tracking-[0.14em] py-3 rounded-xl hover:border-[#D4A574] hover:text-[#D4A574] transition-all"
                                >
                                    <SparklesIcon className="h-4 w-4" />
                                    Try On Virtually
                                </button>
                            )}
                        </div>

                        {/* Trust badges */}
                        <div className="flex flex-wrap gap-4 pt-1">
                            {['Free returns', 'Secure checkout', 'Genuine products'].map((t) => (
                                <div key={t} className="flex items-center gap-1.5 text-xs text-[#D4D4D4]/70">
                                    <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />
                                    {t}
                                </div>
                            ))}
                        </div>

                        {/* Product details card */}
                        <div className="border border-white/10 bg-white/5 p-5 rounded-xl">
                            <h3 className="text-xs uppercase tracking-[0.1em] font-semibold text-white mb-4 flex items-center gap-2">
                                <TagIcon className="h-3.5 w-3.5 text-[#D4A574]" />
                                Product Details
                            </h3>
                            <p className="text-sm text-[#D4D4D4]/80 leading-relaxed mb-4">
                                {product.description}
                            </p>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm border-t border-white/10 pt-4">
                                {product.material && (
                                    <div>
                                        <span className="text-[#D4D4D4]/60 text-xs uppercase tracking-wide">Material</span>
                                        <p className="text-white font-medium mt-0.5">{product.material}</p>
                                    </div>
                                )}
                                {product.brand && (
                                    <div>
                                        <span className="text-[#D4D4D4]/60 text-xs uppercase tracking-wide">Brand</span>
                                        <p className="text-white font-medium mt-0.5">{product.brand}</p>
                                    </div>
                                )}
                                {product.colors?.length > 0 && (
                                    <div className="col-span-2">
                                        <span className="text-[#D4D4D4]/60 text-xs uppercase tracking-wide">Available Colors</span>
                                        <p className="text-white font-medium mt-0.5">{product.colors.join(', ')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* ── Matching Items ── */}
                <div className="mt-16">
                    <MatchingItems productId={product._id} />
                </div>
            </div>

            {/* AI Try-On Modal */}
            <TryOnModal isOpen={tryOnOpen} onClose={() => setTryOnOpen(false)} product={product} />
        </div>
    );
};

export default ProductDetail;
