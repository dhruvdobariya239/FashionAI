import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBagIcon, Bars3Icon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const { itemCount } = useCart();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinks = [
        { label: 'Men', to: '/men' },
        { label: 'Women', to: '/women' },
        { label: 'Children', to: '/children' },
    ];

    const desktopLinkClass = ({ isActive }) =>
        `text-[0.75rem] tracking-[0.15em] uppercase font-medium transition-all duration-300 pb-0.5 ${
            isActive
                ? 'text-[#D4A574] border-b-2 border-[#D4A574]'
                : 'text-[#D4D4D4] hover:text-white'
        }`;

    const mobileLinkClass = ({ isActive }) =>
        `block text-[0.75rem] tracking-[0.15em] uppercase font-medium py-2 transition-colors duration-300 ${
            isActive
                ? 'text-[#D4A574]'
                : 'text-[#D4D4D4] hover:text-white'
        }`;

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-[#1a1a1a]/95 backdrop-blur-md border-b border-[#D4A574]/30 shadow-lg'
                    : 'bg-[#1a1a1a] border-b border-[#D4A574]/20'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0 group hover:opacity-80 transition-opacity">
                        <img
                            src="/1000273660.png"
                            alt="Fashion Store Logo"
                            className="h-16 w-auto opacity-100 group-hover:opacity-100 transition-opacity"
                        />
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={desktopLinkClass}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">

                        {/* Cart */}
                        <NavLink
                            to="/cart"
                            className={({ isActive }) =>
                                `relative p-2 transition-colors duration-300 ${
                                    isActive
                                        ? 'text-[#D4A574]'
                                        : 'text-[#D4D4D4] hover:text-[#D4A574]'
                                }`
                            }
                        >
                            <ShoppingBagIcon className="h-5 w-5" />
                            {itemCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-[#D4A574] text-[#1a1a1a] text-[0.6rem] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                                    {itemCount > 9 ? '9+' : itemCount}
                                </span>
                            )}
                        </NavLink>

                        {/* Auth — Desktop */}
                        {isAuthenticated ? (
                            <div className="hidden md:flex items-center gap-4">
                                <NavLink
                                    to="/profile"
                                    className={({ isActive }) =>
                                        `flex items-center gap-1.5 text-[0.75rem] tracking-[0.1em] uppercase transition-all duration-300 pb-0.5 ${
                                            isActive
                                                ? 'text-[#D4A574] border-b-2 border-[#D4A574]'
                                                : 'text-[#D4D4D4] hover:text-[#D4A574]'
                                        }`
                                    }
                                >
                                    <UserIcon className="h-4 w-4" />
                                    {user?.name?.split(' ')[0]}
                                </NavLink>

                                <NavLink
                                    to="/orders"
                                    className={desktopLinkClass}
                                >
                                    Orders
                                </NavLink>

                                <button
                                    onClick={handleLogout}
                                    className="text-[0.75rem] tracking-[0.1em] uppercase text-[#D4D4D4] hover:text-red-400 transition-colors duration-300"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-4">
                                <NavLink
                                    to="/login"
                                    className={desktopLinkClass}
                                >
                                    Login
                                </NavLink>

                                <NavLink
                                    to="/register"
                                    className={desktopLinkClass}
                                >
                                    Register
                                </NavLink>
                            </div>
                        )}

                        {/* Mobile toggle */}
                        <button
                            className="md:hidden p-2 text-[#D4D4D4] hover:text-[#D4A574] transition-colors duration-300"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? (
                                <XMarkIcon className="h-5 w-5" />
                            ) : (
                                <Bars3Icon className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden bg-gradient-to-b from-[#2d2d2d] to-[#1a1a1a] border-t border-[#D4A574]/30 px-6 py-6 space-y-4 backdrop-blur-md">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={() => setMobileOpen(false)}
                            className={mobileLinkClass}
                        >
                            {link.label}
                        </NavLink>
                    ))}

                    <hr className="border-[#D4A574]/20" />

                    {/* Mobile Cart */}
                    <NavLink
                        to="/cart"
                        onClick={() => setMobileOpen(false)}
                        className={mobileLinkClass}
                    >
                        Cart
                    </NavLink>

                    {isAuthenticated ? (
                        <>
                            <NavLink
                                to="/profile"
                                onClick={() => setMobileOpen(false)}
                                className={mobileLinkClass}
                            >
                                Profile
                            </NavLink>

                            <NavLink
                                to="/orders"
                                onClick={() => setMobileOpen(false)}
                                className={mobileLinkClass}
                            >
                                My Orders
                            </NavLink>

                            <button
                                onClick={() => {
                                    handleLogout();
                                    setMobileOpen(false);
                                }}
                                className="block text-[0.75rem] tracking-[0.1em] uppercase text-red-400 hover:text-red-300 transition-colors py-2"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink
                                to="/login"
                                onClick={() => setMobileOpen(false)}
                                className={mobileLinkClass}
                            >
                                Login
                            </NavLink>

                            <NavLink
                                to="/register"
                                onClick={() => setMobileOpen(false)}
                                className={({ isActive }) =>
                                    `block text-[0.75rem] tracking-[0.1em] uppercase font-semibold py-2 px-4 rounded-lg transition-all text-center ${
                                        isActive
                                            ? 'bg-white text-[#1a1a1a] shadow-lg'
                                            : 'bg-[#D4A574] text-[#1a1a1a] hover:shadow-lg'
                                    }`
                                }
                            >
                                Register
                            </NavLink>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;