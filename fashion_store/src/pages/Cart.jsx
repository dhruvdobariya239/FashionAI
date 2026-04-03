import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { TrashIcon, PlusIcon, MinusIcon, ShoppingBagIcon, TruckIcon } from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

const Cart = () => {
    const { cart, updateItem, removeItem } = useCart();
    const items = cart?.items || [];

    // ── Empty state ──────────────────────────────────────────────────────────
    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] pt-20 flex items-center justify-center">
                <div className="text-center px-4">
                    <div className="w-20 h-20 rounded-full border-2 border-[#D4A574]/30 bg-[#2d2d2d] flex items-center justify-center mx-auto mb-6">
                        <ShoppingBagIcon className="h-9 w-9 text-[#D4A574]" />
                    </div>
                    <h2
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-3xl font-bold text-white mb-2"
                    >
                        Your bag is empty
                    </h2>
                    <p className="text-[#D4D4D4] mb-8 text-sm">Discover amazing fashion to add to your bag.</p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 bg-[#D4A574] text-[#1a1a1a] text-sm font-semibold px-8 py-3 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = subtotal > 999 ? 0 : 99;
    const total = subtotal + shipping;

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] pt-20 pb-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">

                {/* ── Page heading ── */}
                <div className="flex items-baseline gap-3 mb-8">
                    <h1
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-4xl font-bold text-white"
                    >
                        Shopping Bag
                    </h1>
                    <span className="text-sm font-medium text-[#D4D4D4]">
                        {items.length} item{items.length !== 1 ? 's' : ''}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ─── Cart Items ─── */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => {
                            const product = item.product;
                            const img = product?.images?.find((i) => i.isMain)?.url || product?.images?.[0]?.url;
                            return (
                                <div key={item._id} className="bg-[#2d2d2d] border-2 border-[#D4A574]/20 rounded-2xl p-4 flex gap-4">

                                    {/* Product image */}
                                    <Link
                                        to={`/product/${product?._id}`}
                                        className="flex-none w-24 h-28 rounded-xl overflow-hidden bg-[#1a1a1a]"
                                    >
                                        <img
                                            src={img}
                                            alt={product?.name}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                    </Link>

                                    {/* Product info */}
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            to={`/product/${product?._id}`}
                                            className="text-white font-semibold text-sm hover:text-[#D4A574] transition-colors duration-300 line-clamp-1"
                                        >
                                            {product?.name}
                                        </Link>
                                        <p className="text-xs text-[#D4D4D4] mt-0.5">
                                            Size: <span className="text-white font-medium">{item.size}</span>
                                        </p>
                                        <p className="text-sm font-bold text-white mt-1">
                                            ₹{(item.price * item.quantity).toLocaleString()}
                                            {item.quantity > 1 && (
                                                <span className="text-xs font-normal text-[#D4D4D4] ml-1">
                                                    (₹{item.price.toLocaleString()} × {item.quantity})
                                                </span>
                                            )}
                                        </p>

                                        {/* Quantity + Remove */}
                                        <div className="flex items-center gap-3 mt-3">
                                            <div className="flex items-center border-2 border-[#D4A574]/30 rounded-full overflow-hidden bg-[#1a1a1a]">
                                                <button
                                                    onClick={() => updateItem(item._id, item.quantity - 1)}
                                                    className="px-3 py-1.5 text-[#D4D4D4] hover:text-[#D4A574] hover:bg-[#3d3d3d] transition-colors duration-300"
                                                >
                                                    <MinusIcon className="h-3.5 w-3.5" />
                                                </button>
                                                <span className="text-sm font-semibold text-white w-6 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateItem(item._id, item.quantity + 1)}
                                                    className="px-3 py-1.5 text-[#D4D4D4] hover:text-[#D4A574] hover:bg-[#3d3d3d] transition-colors duration-300"
                                                >
                                                    <PlusIcon className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item._id)}
                                                className="flex items-center gap-1 text-xs text-[#D4D4D4] hover:text-rose-400 transition-colors duration-300"
                                            >
                                                <TrashIcon className="h-3.5 w-3.5" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ─── Order Summary ─── */}
                    <div className="bg-[#2d2d2d] border-2 border-[#D4A574]/20 rounded-2xl p-6 h-fit sticky top-24">
                        <h2
                            style={{ fontFamily: "'Playfair Display', serif" }}
                            className="text-xl font-bold text-white mb-5"
                        >
                            Order Summary
                        </h2>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-[#D4D4D4]">
                                <span>Subtotal</span>
                                <span className="text-white font-medium">₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[#D4D4D4]">
                                <span>Shipping</span>
                                <span className={`font-semibold ${shipping === 0 ? 'text-emerald-400' : 'text-white'}`}>
                                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                </span>
                            </div>

                            {/* Free shipping notice */}
                            <div className={`flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-medium ${shipping === 0
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-[#1a1a1a] text-[#D4D4D4]'
                                }`}>
                                <TruckIcon className={`h-4 w-4 flex-shrink-0 ${shipping === 0 ? 'text-emerald-400' : 'text-[#D4D4D4]'}`} />
                                {shipping === 0
                                    ? 'You\'ve unlocked free shipping!'
                                    : `Add ₹${(999 - subtotal + 1).toLocaleString()} more for free shipping`
                                }
                            </div>

                            <hr className="border-[#D4A574]/20" />

                            <div className="flex justify-between font-bold text-base">
                                <span className="text-white">Total</span>
                                <span className="text-white">₹{total.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Checkout CTA */}
                        <Link
                            to="/checkout"
                            className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4A574] to-[#C59868] text-[#1a1a1a] text-sm font-semibold py-3.5 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300"
                        >
                            Proceed to Checkout
                        </Link>
                        <Link
                            to="/"
                            className="w-full text-center text-sm text-[#D4D4D4] hover:text-white mt-3 block transition-colors duration-300"
                        >
                            ← Continue Shopping
                        </Link>

                        {/* Trust badges */}
                        <div className="mt-5 pt-4 border-t border-[#D4A574]/20 flex flex-col gap-2">
                            {['Secure Checkout', '30-day Free Returns', '100% Genuine Products'].map((t) => (
                                <div key={t} className="flex items-center gap-2 text-xs text-[#D4D4D4]">
                                    <CheckBadgeIcon className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                                    {t}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Cart;
