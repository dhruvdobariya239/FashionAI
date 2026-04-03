import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ShoppingBagIcon, TruckIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';

const STATUS_CONFIG = {
    processing: { label: 'Processing', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: ClockIcon },
    confirmed: { label: 'Confirmed', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircleIcon },
    shipped: { label: 'Shipped', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: TruckIcon },
    delivered: { label: 'Delivered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircleIcon },
    cancelled: { label: 'Cancelled', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircleIcon },
};

const PAYMENT_CONFIG = {
    paid: { label: 'Paid', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    failed: { label: 'Failed', color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/orders')
            .then(({ data }) => setOrders(data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center pt-16">
            <LoadingSpinner size="lg" text="Loading orders…" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] pt-20 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-[0.65rem] uppercase tracking-[0.18em] font-semibold text-[#D4A574] mb-1">My Account</p>
                        <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl font-bold text-white">
                            My Orders
                        </h1>
                    </div>
                    <Link
                        to="/"
                        className="hidden sm:inline-flex items-center gap-2 border-2 border-[#D4A574]/30 text-[#D4D4D4] text-xs font-semibold px-5 py-2.5 rounded-full hover:border-[#D4A574] hover:text-white transition-all bg-[#2d2d2d]"
                    >
                        <ShoppingBagIcon className="h-4 w-4" />
                        Continue Shopping
                    </Link>
                </div>

                {/* Empty state */}
                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-[#2d2d2d] border-2 border-[#D4A574]/20 rounded-2xl">
                        <div className="w-16 h-16 rounded-full border-2 border-[#D4A574]/30 bg-[#1a1a1a] flex items-center justify-center mx-auto mb-5">
                            <ShoppingBagIcon className="h-7 w-7 text-[#D4A574]" />
                        </div>
                        <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold text-white mb-2">
                            No orders yet
                        </h2>
                        <p className="text-[#D4D4D4] text-sm mb-8">Your order history will appear here.</p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4A574] to-[#C59868] text-[#1a1a1a] text-sm font-semibold px-8 py-3 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const orderStatus = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.processing;
                            const payStatus = PAYMENT_CONFIG[order.paymentStatus] || PAYMENT_CONFIG.pending;
                            const StatusIcon = orderStatus.icon;

                            return (
                                <div key={order._id} className="bg-[#2d2d2d] border-2 border-[#D4A574]/20 rounded-2xl p-6">

                                    {/* Order meta */}
                                    <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                                        <div>
                                            <p className="text-[0.6rem] uppercase tracking-wide text-[#D4D4D4] font-semibold mb-0.5">Order ID</p>
                                            <p className="text-sm font-mono font-bold text-[#D4A574]">
                                                #{order._id.slice(-8).toUpperCase()}
                                            </p>
                                            <p className="text-xs text-[#D4D4D4] mt-0.5">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    year: 'numeric', month: 'long', day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            {/* Order status badge */}
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${orderStatus.color}`}>
                                                <StatusIcon className="h-3.5 w-3.5" />
                                                {orderStatus.label}
                                            </span>
                                            {/* Payment status badge */}
                                            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${payStatus.color}`}>
                                                {payStatus.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div className="space-y-3 pb-4 border-b border-[#D4A574]/20">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-12 h-14 object-cover rounded-lg bg-[#1a1a1a] flex-none border-2 border-[#D4A574]/20"
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-white font-semibold line-clamp-1">{item.name}</p>
                                                    <p className="text-xs text-[#D4D4D4]">
                                                        Size: <span className="font-medium text-[#D4D4D4]">{item.size}</span>
                                                        &nbsp;·&nbsp;Qty: <span className="font-medium text-[#D4D4D4]">{item.quantity}</span>
                                                    </p>
                                                </div>
                                                <p className="text-sm font-bold text-white flex-none">
                                                    ₹{(item.price * item.quantity).toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-4">
                                        <p className="text-xs text-[#D4D4D4]">
                                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                            {order.shippingAddress?.city && ` · Deliver to ${order.shippingAddress.city}`}
                                        </p>
                                        <p className="text-sm font-bold text-white">
                                            Total: <span className="text-[#D4A574]">₹{order.total?.toLocaleString()}</span>
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Bottom CTA */}
                {orders.length > 0 && (
                    <div className="mt-8 text-center">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4A574] to-[#C59868] text-[#1a1a1a] text-sm font-semibold px-8 py-3 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300"
                        >
                            <ShoppingBagIcon className="h-4 w-4" />
                            Continue Shopping
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Orders;
