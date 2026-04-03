import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { SparklesIcon, ArrowLeftIcon, CameraIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SkinToneRecommendations = () => {
    const [profileLoading, setProfileLoading] = useState(true);
    const [photoUrl, setPhotoUrl] = useState('');

    const [toneLoading, setToneLoading] = useState(false);
    const [toneRecs, setToneRecs] = useState(null); // { undertone, depth, preferredColors, items }

    useEffect(() => {
        let alive = true;
        const load = async () => {
            setProfileLoading(true);
            try {
                const { data } = await api.get('/profile');
                if (!alive) return;
                const selectedUrl = data.selectedPhotoUrl || data.photoUrl || '';
                setPhotoUrl(selectedUrl);
            } catch (e) {
                if (!alive) return;
                console.warn(e);
                setPhotoUrl('');
            } finally {
                if (!alive) return;
                setProfileLoading(false);
            }
        };
        load();
        return () => { alive = false; };
    }, []);

    const handleRecommend = async () => {
        if (!photoUrl) {
            toast.error('Upload a body photo first');
            return;
        }
        setToneLoading(true);
        try {
            const { data } = await api.get(`/ai/recommend-by-skin-tone?limit=12&photoUrl=${encodeURIComponent(photoUrl)}`);
            setToneRecs(data);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Could not load recommendations');
        } finally {
            setToneLoading(false);
        }
    };

    if (profileLoading) return (
        <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center pt-16">
            <LoadingSpinner size="lg" text="Loading…" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] pt-20 pb-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
                <div className="flex items-start justify-between gap-4 mb-8">
                    <div>
                        <p className="text-[0.65rem] uppercase tracking-[0.18em] font-semibold text-[#D4A574] mb-1">My Account</p>
                        <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl font-bold text-white">
                            Skin Tone Suggestions
                        </h1>
                        <p className="text-[#D4D4D4] text-sm mt-1 max-w-2xl">
                            Get colors and products that complement your undertone and depth, based on your uploaded body photo.
                        </p>
                    </div>

                    <Link
                        to="/profile"
                        className="inline-flex items-center gap-2 border-2 border-[#D4A574]/30 text-[#D4D4D4] text-xs font-semibold px-5 py-2.5 rounded-full hover:border-[#D4A574] hover:text-white transition-all bg-[#2d2d2d]"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back to Profile
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
                    <div className="bg-[#2d2d2d] border-2 border-[#D4A574]/20 rounded-2xl p-6">
                        <h2 className="text-xs uppercase tracking-[0.12em] font-semibold text-white mb-1 flex items-center gap-2">
                            <CameraIcon className="h-4 w-4 text-[#D4A574]" />
                            Your Photo
                        </h2>
                        <p className="text-xs text-[#D4D4D4] mb-5">Used to estimate skin tone. You can change it in Profile.</p>

                        {photoUrl ? (
                            <div className="rounded-xl overflow-hidden border-2 border-[#D4A574]/20 bg-[#1a1a1a]">
                                <img src={photoUrl} alt="Your selected photo" className="w-full max-h-72 object-contain" />
                            </div>
                        ) : (
                            <div className="rounded-xl border-2 border-dashed border-[#D4A574]/30 px-4 py-6 text-center bg-[#1a1a1a]">
                                <p className="text-sm font-semibold text-white mb-1">No photo uploaded</p>
                                <p className="text-xs text-[#D4D4D4] mb-4">Upload a body photo in Profile to unlock skin tone suggestions.</p>
                                <Link
                                    to="/profile"
                                    className="inline-flex items-center justify-center gap-2 bg-[#D4A574] text-[#1a1a1a] text-xs font-semibold px-5 py-2.5 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300"
                                >
                                    Go to Profile
                                </Link>
                            </div>
                        )}

                        <button
                            type="button"
                            disabled={toneLoading || !photoUrl}
                            onClick={handleRecommend}
                            className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4A574] to-[#C59868] text-[#1a1a1a] text-xs font-semibold px-5 py-2.5 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-60"
                        >
                            {toneLoading ? <LoadingSpinner size="sm" /> : <SparklesIcon className="h-4 w-4" />}
                            {toneLoading ? 'Analyzing…' : 'Generate suggestions'}
                        </button>
                    </div>

                    <div className="bg-[#2d2d2d] border-2 border-[#D4A574]/20 rounded-2xl p-6">
                        {!toneRecs ? (
                            <div className="rounded-xl border border-dashed border-[#E4E0D8] px-4 py-10 text-center bg-white/5]">
                                <p className="text-sm font-semibold text-[#fff] mb-1">Ready when you are</p>
                                <p className="text-xs text-[#8A8680]">
                                    Click “Generate suggestions” to see recommended products for your skin tone.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
                                    <div>
                                        <p className="text-[0.65rem] uppercase tracking-wide font-semibold text-[#8A8680] mb-1">
                                            Results
                                        </p>
                                        <p className="text-sm font-semibold text-[#111110]">
                                            {toneRecs.undertone || 'unknown'}
                                            {toneRecs.depth && toneRecs.depth !== 'unknown' ? ` · ${toneRecs.depth}` : ''}
                                        </p>
                                    </div>
                                    {Array.isArray(toneRecs.preferredColors) && toneRecs.preferredColors.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {toneRecs.preferredColors.slice(0, 6).map((c) => (
                                                <span
                                                    key={c}
                                                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full border-2 border-[#D4A574]/30 bg-[#D4A574]/10 text-[#D4D4D4]"
                                                >
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>

                                {toneRecs?.items?.length ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {toneRecs.items.map((item) => {
                                            const mainImg = item.images?.find((img) => img.isMain)?.url || item.images?.[0]?.url || '';
                                            return (
                                                <Link
                                                    key={item._id}
                                                    to={`/product/${item._id}`}
                                                    className="group rounded-xl border-2 border-[#D4A574]/20 overflow-hidden bg-[#1a1a1a] hover:border-[#D4A574] transition-all duration-300"
                                                >
                                                    <div className="bg-[#0d0d0d] aspect-[4/5] overflow-hidden">
                                                        {mainImg ? (
                                                            <img
                                                                src={mainImg}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                                                            />
                                                        ) : null}
                                                    </div>
                                                    <div className="p-3">
                                                        <p className="text-xs font-semibold text-white line-clamp-2">{item.name}</p>
                                                        <p className="text-[11px] text-[#D4D4D4] mt-1">₹{item.price}</p>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border-2 border-dashed border-[#D4A574]/30 px-4 py-10 text-center bg-[#1a1a1a]">
                                        <p className="text-sm font-semibold text-white mb-1">No matches found</p>
                                        <p className="text-xs text-[#D4D4D4]">Try again after uploading a clearer photo.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkinToneRecommendations;

