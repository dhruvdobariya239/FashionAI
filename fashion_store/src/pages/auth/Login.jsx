import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Different image from Register for visual variety
const AUTH_IMAGE = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=80';

const Login = () => {
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(form.email, form.password);
        if (result.success) {
            toast.success('Welcome back! 👋');
            navigate('/');
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-screen flex pt-16 bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d]">
            {/* Left — Editorial Image */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <img
                    src={AUTH_IMAGE}
                    alt="Fashion login"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a]/70 via-[#1a1a1a]/50 to-[#1a1a1a]/80" />
                {/* Overlay text */}
                <div className="absolute bottom-16 left-12 right-12">
                    <p
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-white text-3xl font-bold italic leading-snug"
                    >
                        "Fashion is the<br />armour to survive<br />everyday life."
                    </p>
                    <p className="mt-3 text-[#D4D4D4]/60 text-sm tracking-widest uppercase">— Bill Cunningham</p>
                </div>
            </div>

            {/* Right — Form */}
            <div className="w-full lg:w-1/2 bg-gradient-to-b from-[#2d2d2d] to-[#1a1a1a] flex items-center justify-center px-8 sm:px-16 py-16">
                <div className="w-full max-w-md">
                    {/* Brand */}
                    <Link to="/" className="block mb-8  group">
                        <span
                            
                        >
                            <img src="../public/1000273660.png" alt="Fashion Store Logo" className="h-18 w-auto" />
                        </span>
                    </Link>

                    <p className="text-xs tracking-[0.2em] uppercase text-[#D4A574] mb-4 font-semibold">Welcome Back</p>
                    <h1
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-4xl font-bold text-white mb-8"
                    >
                        Sign In
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-[0.7rem] tracking-[0.12em] uppercase text-[#D4D4D4] mb-3 font-semibold">Email Address</label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 rounded-lg bg-[#1a1a1a] border-2 border-[#D4A574]/30 text-white placeholder-[#8a8a8a] focus:outline-none focus:border-[#D4A574] focus:shadow-lg transition-all duration-300 font-light"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-[0.7rem] tracking-[0.12em] uppercase text-[#D4D4D4] mb-3 font-semibold">Password</label>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    required
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 pr-12 rounded-lg bg-[#1a1a1a] border-2 border-[#D4A574]/30 text-white placeholder-[#8a8a8a] focus:outline-none focus:border-[#D4A574] focus:shadow-lg transition-all duration-300 font-light"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D4D4D4] hover:text-[#D4A574] transition-colors duration-300"
                                >
                                    {showPass ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-6 py-3.5 bg-gradient-to-r from-[#D4A574] to-[#C59868] text-[#1a1a1a] rounded-lg font-bold text-sm tracking-[0.1em] uppercase hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-60"
                                style={{ opacity: loading ? 0.6 : 1 }}
                            >
                                {loading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </div>
                    </form>

                    <p className="text-sm text-[#D4D4D4] mt-8 text-center">
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="text-[#D4A574] font-semibold hover:text-white transition-colors duration-300">
                            Create one free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
