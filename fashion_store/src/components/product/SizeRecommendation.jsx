import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { CheckBadgeIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

const SizeRecommendation = () => {
    const { isAuthenticated } = useAuth();
    const [rec, setRec] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;
        const fetch = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/ai/recommend-size');
                setRec(data);
            } catch { }
            finally { setLoading(false); }
        };
        fetch();
    }, [isAuthenticated]);

    if (!isAuthenticated) return (
        <div className="bg-[#2d2d2d] border-2 border-[#D4A574]/20 rounded-2xl p-6 text-sm text-[#D4D4D4]/80 flex items-center gap-3">
            <InformationCircleIcon className="h-5 w-5 text-[#D4A574] shrink-0" />
            <span><Link to="/login" className="text-[#D4A574] hover:text-white font-medium">Login</Link> and complete your profile to get your size recommendation.</span>
        </div>
    );

    if (loading) return (
        <div className="bg-white/5 rounded-lg p-5 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-3/4" />
        </div>
    );

    if (!rec || !rec.size) return (
        <div className="bg-white/5 rounded-lg p-5 text-sm text-[#D4D4D4]/80 flex items-center gap-3">
            <InformationCircleIcon className="h-5 w-5 text-[#D4A574] shrink-0" />
            <span>
                Complete your <Link to="/profile" className="text-[#D4A574] hover:text-white font-medium">profile</Link> (height, weight, gender) to get size recommendations.
            </span>
        </div>
    );

    const confidenceColor = { high: 'text-emerald-400', medium: 'text-amber-400', low: 'text-rose-400' }[rec.confidence] || 'text-gray-400';

    return (
        <div className="bg-white/5 rounded-lg p-5">
            <div className="flex items-start gap-3">
                <CheckBadgeIcon className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-white font-semibold text-sm">Recommended Size:</span>
                        <span className="bg-gradient-to-r from-[#D4A574] to-[#C59868] text-[#1a1a1a] text-sm font-bold px-3 py-1 rounded-full">{rec.size}</span>
                        <span className={`text-xs font-medium ${confidenceColor}`}>({rec.confidence})</span>
                    </div>
                    <p className="text-sm text-[#D4D4D4]/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: rec.message?.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                </div>
            </div>
        </div>
    );
};

export default SizeRecommendation;
