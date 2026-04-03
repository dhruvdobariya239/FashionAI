import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { CameraIcon, PhotoIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const API = '/api';

const MobileUpload = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('idle'); // idle | uploading | success | error
    const [preview, setPreview] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const handleFile = async (file) => {
        if (!file) return;
        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);

        // Upload
        setStatus('uploading');
        const formData = new FormData();
        formData.append('photo', file);
        try {
            await axios.post(`${API}/photo/qr-upload/${token}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setStatus('success');
        } catch (err) {
            setStatus('error');
            setErrorMsg(err.response?.data?.message || 'Upload failed. Link may have expired.');
        }
    };

    /* ── Render states ── */

    if (status === 'success') return (
        <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-6 text-center">
            <CheckCircleIcon className="h-16 w-16 text-emerald-500 mb-4" />
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold text-[#111110] mb-2">
                Photo Uploaded!
            </h2>
            <p className="text-[#8A8680] text-sm">
                Your photo has been sent. Go back to the desktop — it will appear automatically.
            </p>
            {preview && (
                <img src={preview} alt="Uploaded" className="mt-6 w-40 h-52 object-cover rounded-2xl border border-[#E4E0D8] shadow" />
            )}
        </div>
    );

    if (status === 'error') return (
        <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-6 text-center">
            <XCircleIcon className="h-16 w-16 text-rose-500 mb-4" />
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold text-[#111110] mb-2">
                Upload Failed
            </h2>
            <p className="text-[#8A8680] text-sm mb-6">{errorMsg}</p>
            <button
                onClick={() => setStatus('idle')}
                className="px-6 py-3 bg-[#111110] text-white text-sm font-semibold rounded-full"
            >
                Try Again
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-6">
            {/* Header */}
            <div className="text-center mb-10">
                <div className="w-14 h-14 bg-[#111110] rounded-full flex items-center justify-center mx-auto mb-4">
                    <CameraIcon className="h-6 w-6 text-white" />
                </div>
                <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold text-[#111110]">
                    Upload Your Photo
                </h1>
                <p className="text-[#8A8680] text-sm mt-2">
                    Take a full-body photo or choose from your gallery.<br />
                    Stand straight, good lighting works best.
                </p>
            </div>

            {/* Preview */}
            {preview && (
                <div className="mb-6">
                    <img src={preview} alt="Preview" className="w-40 h-52 object-cover rounded-2xl border border-[#E4E0D8] shadow" />
                </div>
            )}

            {status === 'uploading' ? (
                <LoadingSpinner size="lg" text="Uploading your photo…" />
            ) : (
                <div className="flex flex-col gap-4 w-full max-w-xs">
                    {/* Take photo with camera */}
                    <button
                        onClick={() => cameraInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-3 bg-[#111110] text-white py-4 rounded-2xl text-sm font-semibold"
                    >
                        <CameraIcon className="h-5 w-5" />
                        Take Photo
                    </button>
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                    />

                    {/* Choose from gallery */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-3 border border-[#111110] text-[#111110] py-4 rounded-2xl text-sm font-semibold"
                    >
                        <PhotoIcon className="h-5 w-5" />
                        Choose from Gallery
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                    />

                    <p className="text-center text-xs text-[#8A8680] mt-2">
                        JPG, PNG or WEBP · Max 10 MB
                    </p>
                </div>
            )}
        </div>
    );
};

export default MobileUpload;
