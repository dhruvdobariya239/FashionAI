import { useState } from 'react';
import { XMarkIcon, ArrowDownTrayIcon, SparklesIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const TryOnModal = ({ isOpen, onClose, product }) => {
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [error, setError] = useState('');
    const [requiresPhoto, setRequiresPhoto] = useState(false);
    const navigate = useNavigate();

    const handleTryOn = async () => {
        setLoading(true);
        setError('');
        setImages([]);
        setRequiresPhoto(false);

        try {
            const { data } = await api.post('/ai/tryon', { productId: product._id });
            setImages(data.images || []);
        } catch (err) {
            const msg = err.response?.data?.message || 'Try-On failed. Please try again.';
            setError(msg);
            if (err.response?.data?.requiresPhoto) setRequiresPhoto(true);
        } finally {
            setLoading(false);
        }
    };

    const downloadImage = (imageData, idx) => {
        const link = document.createElement('a');
        link.href = `data:${imageData.mimeType};base64,${imageData.data}`;
        link.download = `tryon-${product.name}-pose${idx + 1}.jpg`;
        link.click();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-[#2d2d2d] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#2d2d2d]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#D4A574] to-[#C59868] flex items-center justify-center">
                            <SparklesIcon className="h-5 w-5 text-[#1a1a1a]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">AI Virtual Try-On</h2>
                            <p className="text-xs text-[#D4D4D4]/70">{product?.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-[#D4D4D4]/70 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-8">
                    {/* Generate Button */}
                    {images.length === 0 && !loading && (
                        <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#D4A574] to-[#C59868] flex items-center justify-center">
                            <SparklesIcon className="h-10 w-10 text-[#1a1a1a]" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">See yourself in this outfit!</h3>
                            <p className="text-[#D4D4D4]/70 mb-6 max-w-md mx-auto text-sm leading-relaxed">
                                Our AI will generate 3 professional fashion catalog photos of you wearing{' '}
                                <span className="text-[#D4A574] font-medium">{product?.name}</span> in different poses.
                            </p>

                            {error && (
                                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-400/30 rounded-lg text-rose-300 text-sm">
                                    <p>{error}</p>
                                    {requiresPhoto && (
                                        <button
                                            onClick={() => { onClose(); navigate('/profile'); }}
                                            className="mt-2 text-[#D4A574] hover:text-white transition-colors font-medium"
                                        >
                                            Go to Profile to upload your photo →
                                        </button>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={handleTryOn}
                                className="inline-flex items-center gap-2 mx-auto px-8 py-3 bg-gradient-to-r from-[#D4A574] to-[#C59868] text-[#1a1a1a] font-bold text-sm uppercase tracking-[0.08em] rounded-lg hover:shadow-lg hover:shadow-[#D4A574]/30 transition-all duration-300"
                            >
                                <SparklesIcon className="h-4 w-4" />
                                Generate AI Try-On
                            </button>
                            <p className="text-xs text-[#D4D4D4]/50 mt-4">Takes ~30-60 seconds</p>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-16">
                            <div className="relative w-20 h-20 mx-auto mb-4">
                                <div className="absolute inset-0 rounded-full border-4 border-[#D4A574]/30 animate-ping" />
                                <div className="absolute inset-2 rounded-full border-4 border-t-[#D4A574] border-r-[#D4A574] border-b-transparent border-l-transparent animate-spin" />
                                <SparklesIcon className="h-8 w-8 text-[#D4A574] absolute inset-0 m-auto" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Generating your fashion shots...</h3>
                            <p className="text-sm text-[#D4D4D4]/70">Omni-Creator AI is creating your professional look. This takes ~30-60 seconds.</p>
                            <div className="flex justify-center gap-1 mt-4">
                                {['Analyzing body...', 'Fitting outfit...', 'Creating poses...'].map((step, i) => (
                                    <span key={i} className="text-xs text-[#D4D4D4]/50 bg-[#D4A574]/10 px-2 py-1 rounded-full">
                                        {step}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Results Gallery */}
                    {images.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <SparklesIcon className="h-5 w-5 text-[#D4A574]" />
                                <h3 className="text-lg font-bold text-white">Your Fashion Poses</h3>
                                <span className="text-xs text-[#D4D4D4]/70 bg-[#D4A574]/10 px-2 py-0.5 rounded-full ml-auto">
                                    {images.length} poses generated
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative rounded-lg overflow-hidden bg-[#1a1a1a] group">
                                        <img
                                            src={img.url || `data:${img.mimeType};base64,${img.data}`}
                                            alt={`Try-On Pose ${idx + 1}`}
                                            className="w-full aspect-[3/4] object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs font-medium bg-black/60 px-2 py-1 rounded">
                                                Pose {idx + 1}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    if (img.url) {
                                                        const link = document.createElement('a');
                                                        link.href = img.url;
                                                        link.download = `tryon-${product.name}.jpg`;
                                                        link.click();
                                                    } else {
                                                        downloadImage(img, idx);
                                                    }
                                                }}
                                                className="p-2 bg-gradient-to-r from-[#D4A574] to-[#C59868] text-[#1a1a1a] rounded-full hover:shadow-lg transition-all"
                                                title="Download"
                                            >
                                                <ArrowDownTrayIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 flex gap-3 justify-center">
                                <button
                                    onClick={handleTryOn}
                                    className="text-sm py-2 px-4 border-2 border-[#D4A574]/30 text-[#D4D4D4] hover:border-[#D4A574] transition-all rounded-lg"
                                >
                                    Regenerate
                                </button>
                                <button onClick={onClose} className="text-sm py-2 px-4 bg-gradient-to-r from-[#D4A574] to-[#C59868] text-[#1a1a1a] font-semibold rounded-lg hover:shadow-lg transition-all">
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TryOnModal;
