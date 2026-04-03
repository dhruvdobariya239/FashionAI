import { Link } from 'react-router-dom';

const Footer = () => (
    <footer className="bg-[#111110] text-[#FAF8F5]">
        {/* Newsletter Strip */}
        <div className="border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <p className="text-label text-[#C9A84C] mb-2">Stay in the loop</p>
                    <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold">
                        New arrivals, exclusive offers
                    </h3>
                </div>
                <form className="flex w-full md:w-auto gap-0" onSubmit={e => e.preventDefault()}>
                    <input
                        type="email"
                        placeholder="your@email.com"
                        className="bg-white/5 border border-white/20 text-white text-sm px-4 py-3 outline-none flex-1 md:w-64 placeholder:text-white/30 focus:border-[#C9A84C] transition-colors"
                    />
                    <button className="btn-gold" style={{ padding: '0.75rem 1.6rem', fontSize: '0.7rem' }}>
                        Subscribe
                    </button>
                </form>
            </div>
        </div>

        {/* Links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                {/* Brand */}
                <div className="col-span-2 md:col-span-1">
                    <span
                        style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}
                        className="text-3xl font-bold text-white"
                    >
                         <img src="../public/1000273660.png" alt="Fashion Store Logo" className="h-16 w-auto" />
                    </span>
                    <p className="mt-4 text-sm text-white/40 leading-relaxed max-w-xs">
                        AI-powered fashion discovery. Find your size, visualise the look, wear with confidence.
                    </p>
                </div>

                {/* Shop */}
                <div>
                    <p className="text-label text-white/40 mb-5">Shop</p>
                    <ul className="space-y-3">
                        {[['Men', '/men'], ['Women', '/women'], ['Children', '/children']].map(([label, to]) => (
                            <li key={to}>
                                <Link to={to} className="text-sm text-white/60 hover:text-white transition-colors">
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Account */}
                <div>
                    <p className="text-label text-white/40 mb-5">Account</p>
                    <ul className="space-y-3">
                        {[['My Profile', '/profile'], ['My Cart', '/cart'], ['My Orders', '/orders']].map(([label, to]) => (
                            <li key={to}>
                                <Link to={to} className="text-sm text-white/60 hover:text-white transition-colors">
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* AI */}
                <div>
                    <p className="text-label text-white/40 mb-5">AI Features</p>
                    <ul className="space-y-3 text-sm text-white/60">
                        <li>Virtual Try-On</li>
                        <li>Smart Sizing</li>
                        <li>Outfit Matching</li>
                    </ul>
                </div>
            </div>

            <hr className="border-white/10 mt-12 mb-6" />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
                <p>© {new Date().getFullYear()} Vastra. All rights reserved.</p>
                <p>Powered by Vastra - Fashion Meets
Intelligence </p>
            </div>
        </div>
    </footer>
);

export default Footer;
