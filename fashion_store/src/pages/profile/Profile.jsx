import { useEffect, useState, useCallback, useRef } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { QRCodeSVG } from 'qrcode.react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
    CameraIcon, CheckCircleIcon, DevicePhoneMobileIcon,
    UserIcon, ArrowUpTrayIcon, QrCodeIcon, TrashIcon, SparklesIcon
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

/* ── Static data ── */
const GENDERS = [
    { value: 'men', label: 'Men', icon: '♂' },
    { value: 'women', label: 'Women', icon: '♀' },
    { value: 'children', label: 'Children', icon: '✦' },
];

/* ── Size engine ── */
const getSizeRecommendation = (height, weight, gender) => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h < 50 || w < 10) return null;

    const bmi = w / ((h / 100) ** 2);

    // ── Top / shirt size ──
    let topSize;
    if (gender === 'children') {
        if (h < 100) topSize = '2–3Y';
        else if (h < 110) topSize = '4–5Y';
        else if (h < 120) topSize = '5–6Y';
        else if (h < 130) topSize = '7–8Y';
        else if (h < 140) topSize = '9–10Y';
        else if (h < 150) topSize = '11–12Y';
        else topSize = '13–14Y';
    } else if (gender === 'women') {
        if (bmi < 18.5) topSize = 'XS';
        else if (bmi < 21.5) topSize = 'S';
        else if (bmi < 24.5) topSize = 'M';
        else if (bmi < 27.5) topSize = 'L';
        else if (bmi < 31) topSize = 'XL';
        else topSize = 'XXL';
    } else { // men (default)
        if (bmi < 18.5) topSize = 'XS';
        else if (bmi < 22) topSize = 'S';
        else if (bmi < 25) topSize = 'M';
        else if (bmi < 28) topSize = 'L';
        else if (bmi < 32) topSize = 'XL';
        else topSize = 'XXL';
    }

    // ── Waist estimate (skip for children) ──
    let waistCm = null, waistIn = null, pantLabel = null;
    if (gender !== 'children') {
        // Empirical estimate: waist ≈ (height × bmi_factor)
        const factor = 0.37 + (bmi - 18) * 0.008;
        waistCm = Math.round(h * Math.max(0.37, Math.min(factor, 0.58)));
        waistIn = Math.round(waistCm / 2.54);
        // Round waist inches to nearest even
        waistIn = Math.round(waistIn / 2) * 2;
        waistCm = Math.round(waistIn * 2.54);

        // Pant size label
        if (waistIn <= 28) pantLabel = '28" (XS)';
        else if (waistIn <= 30) pantLabel = '30" (S)';
        else if (waistIn <= 32) pantLabel = '32" (M)';
        else if (waistIn <= 34) pantLabel = '34" (L)';
        else if (waistIn <= 36) pantLabel = '36" (XL)';
        else if (waistIn <= 38) pantLabel = '38" (XL)';
        else pantLabel = `${waistIn}" (XXL)`;
    }

    return { topSize, waistCm, waistIn, pantLabel };
};


const FRONTEND_URL = window.location.origin;

/* ── Main Component ── */
const Profile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({ height: '', weight: '', gender: '', bodyType: '', age: '' });
    const [photoUrl, setPhotoUrl] = useState('');
    const [photos, setPhotos] = useState([]); // [{ url, publicId, uploadedAt }]
    const [selectedPhotoPublicId, setSelectedPhotoPublicId] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [removing, setRemoving] = useState(false);

    // QR upload state
    const [uploadMode, setUploadMode] = useState('direct'); // 'direct' | 'qr'
    const [qrSession, setQrSession] = useState(null); // { token, mobileUrl }
    const [qrLoading, setQrLoading] = useState(false);
    const pollRef = useRef(null);

    /* ── Load profile ── */
    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await api.get('/profile');
                setProfile({
                    height: data.height || '', weight: data.weight || '',
                    gender: data.gender || '', bodyType: data.bodyType || '', age: data.age || '',
                });

                const incomingPhotos = Array.isArray(data.photos) ? data.photos : [];
                setPhotos(incomingPhotos);

                const selectedUrl = data.selectedPhotoUrl || data.photoUrl || '';
                const selectedPid = data.selectedPhotoPublicId || data.photoPublicId || '';
                setPhotoUrl(selectedUrl);
                setSelectedPhotoPublicId(selectedPid);
                if (data.skinTone?.undertone && data.skinTone?.undertone !== 'unknown') {
                    // optionally prefetch recommendations
                    // (keep lazy; user can trigger manually)
                }
            } catch (e) {
                console.warn(e);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    /* ── Remove photo ── */
    const handleRemovePhotoByPublicId = async (publicId) => {
        if (!publicId) {
            toast.error('No photo to remove');
            return;
        }
        if (!window.confirm('Remove this body photo?')) return;
        setRemoving(true);
        try {
            const { data } = await api.delete(`/profile/photo/${encodeURIComponent(publicId)}`);
            const nextPhotos = Array.isArray(data.photos) ? data.photos : [];
            setPhotos(nextPhotos);
            setPhotoUrl(data.selectedPhotoUrl || '');
            setSelectedPhotoPublicId(data.selectedPhotoPublicId || '');
            toast.success('Photo removed.');
        } catch (e) {
            console.warn(e);
            toast.error(e.response?.data?.message || 'Could not remove photo');
        } finally {
            setRemoving(false);
        }
    };

    const handleRemovePhoto = async () => {
        await handleRemovePhotoByPublicId(selectedPhotoPublicId);
    };

    /* ── Save measurements ── */
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/profile', profile);
            toast.success('Profile saved!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Save failed');
        } finally { setSaving(false); }
    };

    /* ── Direct file upload (drag-drop / click) ── */
    const onDrop = useCallback(async (acceptedFiles) => {
        if (!acceptedFiles.length) return;
        const formData = new FormData();
        formData.append('photo', acceptedFiles[0]);
        setUploading(true);
        try {
            const { data } = await api.post('/profile/upload-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const nextPhotos = Array.isArray(data.photos) ? data.photos : [];
            setPhotos(nextPhotos);
            setPhotoUrl(data.selectedPhotoUrl || '');
            setSelectedPhotoPublicId(data.selectedPhotoPublicId || '');
            toast.success('Photo uploaded! AI Try-On is now active.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally { setUploading(false); }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop, accept: { 'image/*': [] }, maxFiles: 1,
    });

    /* ── QR flow ── */
    const startQrSession = async () => {
        setQrLoading(true);
        try {
            const { data } = await api.post('/photo/qr-session');
            // Use mobileUrl from backend (has real LAN IP). If missing, build it
            // ourselves by replacing 'localhost' with the server's LAN IP.
            const port = window.location.port || '5174';
            const lanIp = data.lanIp || window.location.hostname;
            const mobileUrl = data.mobileUrl ||
                `http://${lanIp}:${port}/mobile-upload/${data.token}`;
            setQrSession({ token: data.token, mobileUrl });
            // Start polling every 3 seconds
            pollRef.current = setInterval(async () => {
                try {
                    const { data: poll } = await api.get(`/photo/qr-session/${data.token}`);
                    if (poll.done) {
                        clearInterval(pollRef.current);
                        setPhotoUrl(poll.photoUrl);
                        // Refresh profile so the new photo appears in saved gallery too
                        try {
                            const { data: refreshed } = await api.get('/profile');
                            setPhotos(Array.isArray(refreshed.photos) ? refreshed.photos : []);
                            const selectedUrl = refreshed.selectedPhotoUrl || refreshed.photoUrl || poll.photoUrl || '';
                            const selectedPid = refreshed.selectedPhotoPublicId || refreshed.photoPublicId || '';
                            setPhotoUrl(selectedUrl);
                            setSelectedPhotoPublicId(selectedPid);
                        } catch (e) { console.warn(e); }
                        setQrSession(null);
                        setUploadMode('direct');
                        toast.success('Photo received from your phone! 🎉');
                    }
                } catch (e) {
                    console.warn(e);
                    clearInterval(pollRef.current);
                }
            }, 3000);
        } catch (e) {
            console.warn(e);
            toast.error('Could not start QR session');
        } finally { setQrLoading(false); }
    };

    // Cleanup polling on unmount
    useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

    const cancelQr = () => {
        if (pollRef.current) clearInterval(pollRef.current);
        setQrSession(null);
    };

    const mobileUploadUrl = qrSession?.mobileUrl || '';

    /* ── Loading skeleton ── */
    if (loading) return (
        <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center pt-16">
            <LoadingSpinner size="lg" text="Loading profile…" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] pt-20 pb-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">

                {/* ── Page Header ── */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <p className="text-[0.65rem] uppercase tracking-[0.18em] font-semibold text-[#D4A574] mb-1">My Account</p>
                        <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl font-bold text-white">
                            Profile
                        </h1>
                        <p className="text-[#D4D4D4] text-sm mt-1">
                            Complete your profile to unlock AI size recommendations and virtual try-on.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => navigate('/profile/tryon-gallery')}
                            className="inline-flex items-center justify-center gap-2 bg-[#2d2d2d] border-2 border-[#D4A574]/30 text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:border-[#D4A574] hover:text-[#D4A574] transition-all duration-300"
                        >
                            <SparklesIcon className="h-4 w-4 text-[#D4A574]" />
                            Try-on gallery
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (!photoUrl) return toast.error('Upload a photo first');
                                navigate('/profile/skin-tone');
                            }}
                            className="inline-flex items-center justify-center gap-2 bg-[#2d2d2d] border-2 border-[#D4A574]/30 text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:border-[#D4A574] hover:text-[#D4A574] transition-all duration-300"
                        >
                            <SparklesIcon className="h-4 w-4 text-[#D4A574]" />
                            Skin tone suggestions
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 items-start">

                    {/* ─── LEFT: Photo Upload Card ─── */}
                    <div className="bg-[#2d2d2d] border-2 border-[#D4A574]/20 rounded-2xl p-6">
                        <h2 className="text-xs uppercase tracking-[0.12em] font-semibold text-white mb-1 flex items-center gap-2">
                            <CameraIcon className="h-4 w-4 text-[#D4A574]" />
                            Body Photo
                        </h2>
                        <p className="text-xs text-[#D4D4D4] mb-5">Upload a full-body photo to enable AI Try-On.</p>

                        {/* Current photo preview */}
                        {photoUrl && (
                            <div className="mb-5 rounded-xl overflow-hidden border-2 border-[#D4A574]/20">
                                <img src={photoUrl} alt="Your photo" className="w-full max-h-56 object-contain bg-[#1a1a1a]" />
                                <div className="bg-emerald-500/20 px-3 py-1.5 flex items-center justify-between border-t-2 border-emerald-400">
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                        <span className="text-emerald-300 text-xs font-medium">AI Try-On active</span>
                                    </div>
                                    <button
                                        onClick={handleRemovePhoto}
                                        disabled={removing}
                                        className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors duration-300 disabled:opacity-50"
                                    >
                                        <TrashIcon className="h-3.5 w-3.5" />
                                        {removing ? 'Removing…' : 'Remove'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Saved photos gallery */}
                        {photos.length > 0 && (
  <div className="mt-6">
    
    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-white">
                        Your Photos
                      </h3>
                      <span className="text-xs text-[#D4D4D4]">
                        {photos.length} photos
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                      {photos.slice().reverse().map((p) => {
                        const isSelected = p.publicId === selectedPhotoPublicId;

                        return (
                          <div
                            key={p.publicId}
                            className={`relative rounded-xl overflow-hidden group transition-all ${
                              isSelected
                                ? 'ring-2 ring-[#D4A574] shadow-lg shadow-[#D4A574]/20'
                                : 'border-2 border-[#D4A574]/20 hover:border-[#D4A574]/50'
                            }`}>

            {/* IMAGE */}
            <div className="aspect-[3/4] bg-[#1a1a1a]">
              <img
                src={p.url}
                alt="Saved"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
            </div>

            {/* SELECTED BADGE */}
            {isSelected && (
              <div className="absolute top-2 right-2 bg-black text-white p-1 rounded-full">
                <CheckIcon className="h-3 w-3" />
              </div>
            )}

            {/* HOVER ACTIONS */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-end p-2 gap-2">

              {/* SELECT */}
              <button
                onClick={async () => {
                  try {
                    const { data } = await api.put('/profile/select-photo', {
                      publicId: p.publicId,
                    });
                    setSelectedPhotoPublicId(data.selectedPhotoPublicId || p.publicId);
                    setPhotoUrl(data.selectedPhotoUrl || p.url);
                    toast.success('Selected');
                  } catch {
                    toast.error('Error');
                  }
                }}
                className="flex-1 bg-white text-black text-xs font-semibold py-1.5 rounded-md"
              >
                Select
              </button>

              {/* DELETE */}
              <button
                onClick={() => handleRemovePhotoByPublicId(p.publicId)}
                className="flex-1 bg-red-500 text-white text-xs font-semibold py-1.5 rounded-md"
              >
                Delete
              </button>

            </div>
          </div>
        );
      })}
    </div>
  </div>
)}
                        {/* Skin-tone recommendations */}
                       <div className="mb-6">
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!photoUrl) return toast.error('Upload a photo first');
                                    navigate('/profile/skin-tone');
                                }}
                                className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#111110] text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-[#2a2a28] transition-colors disabled:opacity-60"
                            >
                                Recommend clothes for my skin tone
                            </button>
                        </div>
                        {/* Upload mode toggle */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => { setUploadMode('direct'); cancelQr(); }}
                                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-full border transition-all ${uploadMode === 'direct'
                                    ? 'bg-[#111110] text-white border-[#111110]'
                                    : 'border-[#E4E0D8] text-[#5C5955] hover:border-[#111110]'
                                    }`}
                            >
                                <ArrowUpTrayIcon className="h-3.5 w-3.5" />
                                From Device
                            </button>
                            <button
                                onClick={() => setUploadMode('qr')}
                                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-full border transition-all ${uploadMode === 'qr'
                                    ? 'bg-[#111110] text-white border-[#111110]'
                                    : 'border-[#E4E0D8] text-[#5C5955] hover:border-[#111110]'
                                    }`}
                            >
                                <QrCodeIcon className="h-3.5 w-3.5" />
                                Scan QR
                            </button>
                        </div>

                        {/* ── Direct upload zone ── */}
                        {uploadMode === 'direct' && (
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive
                                    ? 'border-[#C9A84C] bg-[#C9A84C]/5'
                                    : 'border-[#E4E0D8] hover:border-[#111110] hover:bg-[#FAF8F5]'
                                    }`}
                            >
                                <input {...getInputProps()} />
                                {uploading ? (
                                    <LoadingSpinner size="md" text="Uploading…" />
                                ) : (
                                    <>
                                        <UserIcon className="h-10 w-10 text-[#C9A84C] mx-auto mb-3" />
                                        <p className="text-sm font-medium text-[#111110]">
                                            {isDragActive ? 'Drop photo here' : 'Drag & drop or click to upload'}
                                        </p>
                                        <p className="text-xs text-[#8A8680] mt-1">Full-body · JPG, PNG, WEBP</p>
                                    </>
                                )}
                            </div>
                        )}

                        {/* ── QR code zone ── */}
                        {uploadMode === 'qr' && (
                            <div className="text-center">
                                {qrSession && mobileUploadUrl ? (
                                    <>
                                        <div className="inline-block bg-white border border-[#E4E0D8] p-3 rounded-xl mb-3 shadow-sm">
                                            <QRCodeSVG
                                                value={mobileUploadUrl}
                                                size={160}
                                                fgColor="#111110"
                                                bgColor="#FFFFFF"
                                                level="M"
                                            />
                                        </div>
                                        <div className="flex items-center justify-center gap-1.5 mb-2">
                                            <span className="relative flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                            </span>
                                            <p className="text-xs text-emerald-700 font-medium">Waiting for your phone…</p>
                                        </div>
                                        <p className="text-[10px] text-[#8A8680] mb-1 break-all px-2">{mobileUploadUrl}</p>
                                        <p className="text-xs text-[#8A8680] mb-3">Scan this QR with your phone to take or upload a photo</p>
                                        <button onClick={cancelQr} className="text-xs text-rose-500 hover:underline">Cancel</button>
                                    </>
                                ) : (
                                    <div className="border-2 border-dashed border-[#E4E0D8] rounded-xl p-8">
                                        <DevicePhoneMobileIcon className="h-10 w-10 text-[#C9A84C] mx-auto mb-3" />
                                        <p className="text-sm font-medium text-[#8A8680] mb-1">Use Your Phone Camera</p>
                                        <p className="text-xs text-[#8A8680] mb-4">
                                            Generate a QR code — scan it on your phone to take or upload a photo directly
                                        </p>
                                        <button
                                            onClick={startQrSession}
                                            disabled={qrLoading}
                                            className="inline-flex items-center gap-2 bg-[#111110] text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-[#2a2a28] transition-colors disabled:opacity-60"
                                        >
                                            {qrLoading ? <LoadingSpinner size="sm" /> : <QrCodeIcon className="h-4 w-4" />}
                                            {qrLoading ? 'Generating…' : 'Generate QR Code'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ─── RIGHT: Body Measurements Card ─── */}
                    <div className="bg-[#2d2d2d] border-2 border-[#D4A574]/20 rounded-2xl p-6">
                        <h2 className="text-xs uppercase tracking-[0.12em] font-semibold text-[#fff] mb-1">
                            Body Measurements
                        </h2>
                        <p className="text-xs text-[#8A8680] mb-5">Used for smart AI size recommendations.</p>

                        <form onSubmit={handleSave} className="space-y-5">

                            {/* Height + Weight */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { key: 'height', label: 'Height (cm)', min: 50, max: 250, placeholder: '170' },
                                    { key: 'weight', label: 'Weight (kg)', min: 10, max: 300, placeholder: '65' },
                                ].map(({ key, label, min, max, placeholder }) => (
                                    <div key={key}>
                                        <label className="text-[0.65rem] uppercase tracking-wide font-semibold text-[#8A8680] block mb-1.5">
                                            {label}
                                        </label>
                                        <input
                                            type="number" min={min} max={max}
                                            value={profile[key]}
                                            onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                                            placeholder={placeholder}
                                            className="w-full bg-[#d4d4d408] border border-[#E4E0D8] text-[#111110] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#111110] placeholder-[#C8C4BC]"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Age */}
                            <div>
                                <label className="text-[0.65rem] uppercase tracking-wide font-semibold text-[#8A8680] block mb-1.5">Age</label>
                                <input
                                    type="number" min="0" max="120"
                                    value={profile.age}
                                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                                    placeholder="Your age"
                                    className="w-full bg-[#d4d4d408] border border-[#E4E0D8] text-[#111110] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#111110] placeholder-[#C8C4BC]"
                                />
                            </div>

                            {/* Gender — icon pills */}
                            <div>
                                <label className="text-[0.65rem] uppercase tracking-wide font-semibold text-[#8A8680] block mb-2">Gender</label>
                                <div className="flex gap-2">
                                    {GENDERS.map(({ value, label, icon }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setProfile({ ...profile, gender: value })}
                                            className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-semibold transition-all ${profile.gender === value
                                                ? 'bg-[#111110] border-[#111110] text-white'
                                                : 'border-[#E4E0D8] text-[#5C5955] hover:border-[#111110] hover:text-[#111110] bg-[#FAF8F5]'
                                                }`}
                                        >
                                            <span className="text-lg leading-none">{icon}</span>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>


                            {/* ── Suggested Sizes ── */}
                            {(() => {
                                const rec = getSizeRecommendation(profile.height, profile.weight, profile.gender);
                                if (!rec) return (
                                    <div className="rounded-xl border border-dashed border-[#E4E0D8] px-4 py-4 text-center">
                                        <p className="text-xs text-[#8A8680]">Enter height, weight &amp; gender above to see your suggested sizes.</p>
                                    </div>
                                );
                                return (
                                    <div className="rounded-xl border border-[#C9A84C]/30 bg-[#FDFBF6] px-4 py-4">
                                        <p className="text-[0.6rem] uppercase tracking-[0.14em] font-semibold text-[#C9A84C] mb-3">✦ Suggested Sizes</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Top size */}
                                            <div className="bg-white rounded-lg border border-[#E4E0D8] px-3 py-3 text-center">
                                                <p className="text-[0.6rem] uppercase tracking-wide text-[#8A8680] mb-1">Top / Shirt</p>
                                                <p className="text-2xl font-black text-[#111110] leading-none">{rec.topSize}</p>
                                            </div>
                                            {/* Waist */}
                                            {rec.waistCm ? (
                                                <div className="bg-white rounded-lg border border-[#E4E0D8] px-3 py-3 text-center">
                                                    <p className="text-[0.6rem] uppercase tracking-wide text-[#8A8680] mb-1">Waist (Pants)</p>
                                                    <p className="text-2xl font-black text-[#111110] leading-none">{rec.waistIn}&quot;</p>
                                                    <p className="text-[0.65rem] text-[#8A8680] mt-0.5">{rec.waistCm} cm · {rec.pantLabel}</p>
                                                </div>
                                            ) : null}
                                        </div>
                                        <p className="text-[0.6rem] text-[#8A8680] mt-2 text-center">Estimates based on your measurements · try for reference only</p>
                                    </div>
                                );
                            })()}

                            {/* Save button */}
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full flex items-center justify-center gap-2 bg-[#111110] text-white text-sm font-semibold py-3.5 rounded-full hover:bg-[#2a2a28] transition-colors disabled:opacity-60"
                            >
                                {saving ? <LoadingSpinner size="sm" /> : null}
                                {saving ? 'Saving…' : 'Save Profile'}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;
