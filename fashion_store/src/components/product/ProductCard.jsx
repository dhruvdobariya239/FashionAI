import { Link } from 'react-router-dom';
import { ShoppingBagIcon, StarIcon } from '@heroicons/react/24/solid';
import { SparklesIcon } from '@heroicons/react/24/outline';

const ProductCard = ({ product, onAddToCart }) => {
    const mainImage = product.images?.find((i) => i.isMain)?.url || product.images?.[0]?.url;
    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <div className="group" >
            {/* Image Container */}
            <Link to={`/product/${product._id}`} className="block relative overflow-hidden aspect-[3/4] bg-[#1a1a1a] rounded-2xl border border-[#D4A574]/20 mb-4">
                <img
                    src={mainImage || 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />

                {/* Badges (top left) */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {discount > 0 && (
                        <span className="text-[0.6rem] font-medium tracking-[0.08em] uppercase px-2 py-1 bg-[#D4A574] text-[#1a1a1a] rounded">-{discount}%</span>
                    )}
                    {product.tryOnSupported && (
                        <span className="text-[0.6rem] font-medium tracking-[0.08em] uppercase px-2 py-1 bg-[#D4A574]/10 border border-[#D4A574]/30 text-[#D4D4D4] flex items-center gap-1 rounded">
                            <SparklesIcon className="h-2.5 w-2.5" /> Try-On
                        </span>
                    )}
                </div>
            </Link>

            {/* Info Section */}
            <div>
                <Link to={`/product/${product._id}`} className="block group/link">
                    <p className="text-[0.65rem] tracking-[0.14em] uppercase text-[#D4D4D4]/70 mb-2 font-medium">
                        {product.subcategory}
                    </p>
                    <h3 className="text-base font-medium text-white line-clamp-2 group-hover/link:text-[#D4A574] transition-colors mb-3">
                        {product.name}
                    </h3>
                </Link>

                {/* Rating */}
                {product.rating > 0 && (
                    <div className="flex items-center gap-1.5 mb-3">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon key={i} className={`h-3 w-3 ${i < Math.round(product.rating) ? 'text-[#D4A574]' : 'text-[#D4A574]/30'}`} />
                            ))}
                        </div>
                        <span className="text-xs text-[#D4D4D4]">{product.rating.toFixed(1)} ({product.numReviews} reviews)</span>
                    </div>
                )}

                {/* Price Section */}
                <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-xl font-bold text-white">₹{product.price.toLocaleString()}</span>
                    {product.originalPrice && (
                        <span className="text-sm text-[#D4D4D4]/70 line-through">₹{product.originalPrice.toLocaleString()}</span>
                    )}
                    {discount > 0 && (
                        <span className="text-xs font-semibold text-emerald-400">{discount}% OFF</span>
                    )}
                </div>

                {/* Add to Bag Button */}
                <button
                    onClick={() => onAddToCart?.(product)}
                    className="w-full bg-gradient-to-r from-[#D4A574] to-[#C59868] text-[#1a1a1a] text-sm font-bold tracking-[0.08em] uppercase py-3 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#D4A574]/30 hover:scale-105 transition-all duration-300"
                >
                    <ShoppingBagIcon className="h-4 w-4" /> Add to Bag
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
