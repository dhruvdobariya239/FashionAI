import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
    TruckIcon, CreditCardIcon, BanknotesIcon,
    ShoppingBagIcon, CheckCircleIcon
} from '@heroicons/react/24/outline';

const PAYMENT_METHODS = [
    { value: 'cod', label: 'Cash on Delivery', icon: BanknotesIcon },
    { value: 'online', label: 'Pay Online', icon: CreditCardIcon },
];

const FIELD = (id, label, placeholder, type = 'text', required = true) =>
    ({ id, label, placeholder, type, required });

const ADDRESS_FIELDS = [
    FIELD('fullName', 'Full Name', 'John Doe'),
    FIELD('phone', 'Phone', '+91 98765 43210', 'tel'),
    FIELD('line1', 'Address Line 1', '123, Street Name'),
    FIELD('line2', 'Address Line 2 (optional)', 'Apt, Suite, etc.', 'text', false),
    FIELD('city', 'City', 'Mumbai'),
    FIELD('state', 'State', 'Maharashtra'),
    FIELD('pincode', 'PIN Code', '400001'),
];

const Checkout = () => {
    const navigate = useNavigate();
    const { cart, fetchCart } = useCart();
    const items = cart?.items || [];

    const [address, setAddress] = useState({ fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [notes, setNotes] = useState('');
    const [placing, setPlacing] = useState(false);
    const [done, setDone] = useState(null); // holds placed order

    if (items.length === 0 && !done) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] pt-20 flex items-center justify-center">
                <div className="text-center px-4">
                    <ShoppingBagIcon className="h-14 w-14 text-[#D4A574] mx-auto mb-4" />
                    <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl font-bold text-white mb-2">Your bag is empty</h2>
                    <Link to="/" className="inline-flex items-center gap-2 bg-[#D4A574] text-[#1a1a1a] text-sm font-semibold px-8 py-3 rounded-full mt-4 hover:shadow-lg hover:scale-105 transition-all duration-300">
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    /* ── Order confirmed state ── */
    if (done) {
        const orderId = done?._id ? done._id.slice(-8).toUpperCase() : 'ORDER';
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] pt-20 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto mb-6">
                        <CheckCircleIcon className="h-10 w-10 text-emerald-400" />
                    </div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl font-bold text-white mb-2">Order Placed!</h2>
                    <p className="text-[#D4D4D4] text-sm mb-1">Order <span className="font-mono font-semibold text-[#D4A574]">#{orderId}</span></p>
                    <p className="text-[#D4D4D4] text-sm mb-8">
                        We'll send you a confirmation shortly. Thank you for shopping with us!
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link to="/orders" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4A574] to-[#C59868] text-[#1a1a1a] text-sm font-semibold py-3.5 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300">
                            View My Orders
                        </Link>
                        <Link to="/" className="text-sm text-[#D4D4D4] hover:text-white transition-colors duration-300">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = subtotal > 999 ? 0 : 99;
    const total = subtotal + shipping;

   const handlePlace = async (e) => {
    e.preventDefault();

    const missing = ADDRESS_FIELDS.filter(f => f.required && !address[f.id]?.trim());
    if (missing.length) {
        toast.error(`Please fill: ${missing.map(f => f.label).join(', ')}`);
        return;
    }

    setPlacing(true);

    try {
        const shippingAddress = {
            fullName: address.fullName,
            phone: address.phone,
            addressLine1: address.line1,
            addressLine2: address.line2 || undefined,
            city: address.city,
            state: address.state,
            postalCode: address.pincode,
            country: 'India',
        };

        // ✅ COD (same as before)
        if (paymentMethod === "cod") {
            const { data } = await api.post('/orders', {
                shippingAddress,
                paymentMethod,
                notes
            });

            await fetchCart?.();
            setDone(data);
            toast.success('Order placed successfully! 🎉');
        }

        // ✅ STRIPE PAYMENT
        else {
            const { data } = await api.post('/payment/create-checkout-session', {
                items,
                shippingAddress,
                notes
            });

            // 🔥 Redirect to Stripe
            window.location.href = data.url;
        }

    } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
        setPlacing(false);
    }
};
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] pt-20 pb-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">

                {/* Header */}
                <div className="mb-8">
                    <p className="text-[0.65rem] uppercase tracking-[0.18em] font-semibold text-[#D4A574] mb-1">Final Step</p>
                    <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl font-bold text-white">Checkout</h1>
                </div>

                <form onSubmit={handlePlace}>
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

                        {/* ─── Left: Address + Payment ─── */}
                        <div className="space-y-6">

                            {/* Shipping address */}
                            <div className="bg-[#2d2d2d] border-2 border-[#D4A574]/20 rounded-2xl p-6">
                                <h2 className="text-xs uppercase tracking-[0.12em] font-semibold text-white mb-5 flex items-center gap-2">
                                    <TruckIcon className="h-4 w-4 text-[#D4A574]" />
                                    Delivery Address
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {ADDRESS_FIELDS.map(({ id, label, placeholder, type, required }) => (
                                        <div key={id} className={id === 'line1' || id === 'line2' ? 'sm:col-span-2' : ''}>
                                            <label className="text-[0.65rem] uppercase tracking-wide font-semibold text-[#D4D4D4] block mb-1.5">
                                                {label}
                                            </label>
                                            <input
                                                type={type}
                                                value={address[id]}
                                                onChange={e => setAddress({ ...address, [id]: e.target.value })}
                                                placeholder={placeholder}
                                                required={required}
                                                className="w-full bg-[#1a1a1a] border-2 border-[#D4A574]/30 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4A574] focus:shadow-lg placeholder-[#8a8a8a] transition-all duration-300"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4">
                                    <label className="text-[0.65rem] uppercase tracking-wide font-semibold text-[#D4D4D4] block mb-1.5">
                                        Order Notes (optional)
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        placeholder="Any special instructions for delivery…"
                                        className="w-full bg-[#1a1a1a] border-2 border-[#D4A574]/30 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4A574] focus:shadow-lg placeholder-[#8a8a8a] resize-none transition-all duration-300"
                                    />
                                </div>
                            </div>

                            {/* Payment method */}
                            <div className="bg-[#2d2d2d] border-2 border-[#D4A574]/20 rounded-2xl p-6">
                                <h2 className="text-xs uppercase tracking-[0.12em] font-semibold text-white mb-4 flex items-center gap-2">
                                    <CreditCardIcon className="h-4 w-4 text-[#D4A574]" />
                                    Payment Method
                                </h2>
                                <div className="grid grid-cols-2 gap-3">
                                    {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setPaymentMethod(value)}
                                            className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 text-xs font-semibold transition-all ${paymentMethod === value
                                                ? 'bg-[#D4A574]/20 border-[#D4A574] text-[#D4A574]'
                                                : 'border-[#D4A574]/30 text-[#D4D4D4] hover:border-[#D4A574] bg-[#1a1a1a]'
                                                }`}
                                        >
                                            <Icon className="h-6 w-6" />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                {paymentMethod === 'online' && (
                                    <p className="mt-3 text-xs text-[#D4D4D4] text-center">
                                     Secure payment via UPI / Card / Wallet
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* ─── Right: Order Summary ─── */}
                        <div className="bg-[#2d2d2d] border-2 border-[#D4A574]/20 rounded-2xl p-6 sticky top-24">
                            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold text-white mb-4">
                                Order Summary
                            </h2>

                            {/* Items list */}
                            <div className="space-y-3 mb-5 max-h-52 overflow-y-auto pr-1">
                                {items.map((item) => {
                                    const img = item.product?.images?.find(i => i.isMain)?.url || item.product?.images?.[0]?.url;
                                    return (
                                        <div key={item._id} className="flex gap-3">
                                            <div className="w-12 h-14 rounded-lg overflow-hidden bg-[#1a1a1a] flex-none">
                                                {img && <img src={img} alt={item.product?.name} className="w-full h-full object-cover" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-white line-clamp-1">{item.product?.name}</p>
                                                <p className="text-[0.65rem] text-[#D4D4D4]">Size: {item.size} · Qty: {item.quantity}</p>
                                                <p className="text-xs font-bold text-white mt-0.5">₹{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <hr className="border-[#D4A574]/20 mb-4" />

                            <div className="space-y-2 text-sm mb-5">
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
                                <hr className="border-[#D4A574]/20" />
                                <div className="flex justify-between font-bold text-base">
                                    <span className="text-white">Total</span>
                                    <span className="text-white">₹{total.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={placing}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4A574] to-[#C59868] text-[#1a1a1a] text-sm font-semibold py-3.5 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-60"
                            >
                                {placing ? <LoadingSpinner size="sm" /> : null}
                                {placing ? 'Placing Order…' : 'Place Order'}
                            </button>

                            <Link to="/cart" className="block text-center text-sm text-[#D4D4D4] hover:text-white mt-3 transition-colors duration-300">
                                ← Back to Bag
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
