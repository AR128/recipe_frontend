import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/useAuth';
import { uploadImage } from '../api/recipeApi';

const ASPECT_RATIOS = [
    { label: '16:9 Header', value: 16 / 9 },
    { label: '4:3 Recipe', value: 4 / 3 },
    { label: '1:1 Square', value: 1 / 1 },
    { label: 'Freeform', value: null },
];

function ImageUploadModal({ isOpen, onClose, onSelectImage }) {
    const { accessToken, token } = useAuth();
    const authToken = accessToken || token;

    const [imageSrc, setImageSrc] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    // Editing states
    const [rotation, setRotation] = useState(0); // in degrees: 0, 90, 180, 270
    const [aspectRatio, setAspectRatio] = useState(16 / 9);
    const [zoom, setZoom] = useState(1);
    const [flipH, setFlipH] = useState(false);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [startPan, setStartPan] = useState({ x: 0, y: 0 });

    const fileInputRef = useRef(null);
    const canvasRef = useRef(null);
    const loadedImgRef = useRef(null);

    // Lock background scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Reset editor on close or new file
    const resetEditor = () => {
        setRotation(0);
        setAspectRatio(16 / 9);
        setZoom(1);
        setFlipH(false);
        setPanOffset({ x: 0, y: 0 });
    };

    const handleFileSelect = (selectedFile) => {
        if (!selectedFile || !selectedFile.type.startsWith('image/')) {
            alert('Please select a valid image file (JPEG, PNG, WEBP, etc.)');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                loadedImgRef.current = img;
                setImageSrc(e.target.result);
                resetEditor();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    // Draw canvas preview
    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const img = loadedImgRef.current;
        if (!canvas || !img) return;

        const ctx = canvas.getContext('2d');
        const containerWidth = canvas.width;
        const containerHeight = canvas.height;

        ctx.clearRect(0, 0, containerWidth, containerHeight);
        ctx.save();

        // Background color
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, containerWidth, containerHeight);

        // Move origin to center of canvas
        ctx.translate(containerWidth / 2 + panOffset.x, containerHeight / 2 + panOffset.y);

        // Rotation & Flip
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH ? -zoom : zoom, zoom);

        // Draw image centered
        const imgAspect = img.width / img.height;
        let drawW = containerWidth;
        let drawH = containerWidth / imgAspect;

        if (drawH < containerHeight) {
            drawH = containerHeight;
            drawW = containerHeight * imgAspect;
        }

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        // Overlay crop box guide if applicable
        if (aspectRatio) {
            ctx.save();
            let cropW = containerWidth * 0.85;
            let cropH = cropW / aspectRatio;

            if (cropH > containerHeight * 0.85) {
                cropH = containerHeight * 0.85;
                cropW = cropH * aspectRatio;
            }

            const cropX = (containerWidth - cropW) / 2;
            const cropY = (containerHeight - cropH) / 2;

            // Darken region outside crop area
            ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
            ctx.beginPath();
            ctx.rect(0, 0, containerWidth, containerHeight);
            ctx.rect(cropX, cropY, cropW, cropH);
            ctx.fill('evenodd');

            // Draw border guide
            ctx.strokeStyle = '#f97316'; // Accent brand color
            ctx.lineWidth = 2;
            ctx.strokeRect(cropX, cropY, cropW, cropH);

            // Rule of thirds grid lines inside crop box
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;

            ctx.beginPath();
            // Vertical grid lines
            ctx.moveTo(cropX + cropW / 3, cropY);
            ctx.lineTo(cropX + cropW / 3, cropY + cropH);
            ctx.moveTo(cropX + (2 * cropW) / 3, cropY);
            ctx.lineTo(cropX + (2 * cropW) / 3, cropY + cropH);
            // Horizontal grid lines
            ctx.moveTo(cropX, cropY + cropH / 3);
            ctx.lineTo(cropX + cropW, cropY + cropH / 3);
            ctx.moveTo(cropX, cropY + (2 * cropH) / 3);
            ctx.lineTo(cropX + cropW, cropY + (2 * cropH) / 3);
            ctx.stroke();

            ctx.restore();
        }
    }, [rotation, aspectRatio, zoom, flipH, panOffset]);

    useEffect(() => {
        if (imageSrc) {
            drawCanvas();
        }
    }, [imageSrc, drawCanvas]);

    // Pan controls
    const handleMouseDown = (e) => {
        setIsMouseDown(true);
        setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    };

    const handleMouseMove = (e) => {
        if (!isMouseDown) return;
        setPanOffset({
            x: e.clientX - startPan.x,
            y: e.clientY - startPan.y,
        });
    };

    const handleMouseUp = () => {
        setIsMouseDown(false);
    };

    // Export final edited photo & upload to Cloudinary
    const handleCropSubmit = async () => {
        const img = loadedImgRef.current;
        if (!img) return;

        setUploading(true);
        setUploadError('');

        try {
            const exportCanvas = document.createElement('canvas');
            let targetWidth = 1200;
            let targetHeight = aspectRatio ? Math.round(targetWidth / aspectRatio) : Math.round(targetWidth / (img.width / img.height));

            exportCanvas.width = targetWidth;
            exportCanvas.height = targetHeight;
            const ctx = exportCanvas.getContext('2d');

            // Render high resolution export
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, targetWidth, targetHeight);
            ctx.save();
            ctx.translate(targetWidth / 2 + (panOffset.x * (targetWidth / 540)), targetHeight / 2 + (panOffset.y * (targetHeight / 360)));
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.scale(flipH ? -zoom : zoom, zoom);

            const imgAspect = img.width / img.height;
            let drawW = targetWidth;
            let drawH = targetWidth / imgAspect;

            if (drawH < targetHeight) {
                drawH = targetHeight;
                drawW = targetHeight * imgAspect;
            }

            ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
            ctx.restore();

            const croppedDataUrl = exportCanvas.toDataURL('image/jpeg', 0.92);

            // Upload to Cloudinary via backend API endpoint
            let finalUrl = croppedDataUrl;
            try {
                const res = await uploadImage(croppedDataUrl, authToken);
                if (res && res.url) {
                    finalUrl = res.url;
                }
            } catch (err) {
                console.warn('Direct upload warning (will retry on submit):', err);
            }

            onSelectImage(finalUrl);
            handleClose();
        } catch (err) {
            console.error('Photo export error:', err);
            setUploadError(err.message || 'Failed to process photo');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setImageSrc(null);
        setUploadError('');
        setUploading(false);
        resetEditor();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(4px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
            }}
            onClick={handleClose}
        >
            <div
                style={{
                    background: 'var(--color-surface, #1e293b)',
                    color: 'var(--color-text-primary, #f8fafc)',
                    borderRadius: 20,
                    width: '100%',
                    maxWidth: 720,
                    maxHeight: '92vh',
                    overflowY: 'auto',
                    border: '1px solid var(--color-border, #334155)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--color-text-primary, #fff)' }}>
                        {imageSrc ? '🎨 Edit Food Photo' : '📷 Upload Food Photo'}
                    </h3>
                    <button
                        onClick={handleClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-muted, #94a3b8)',
                            fontSize: 22,
                            cursor: 'pointer',
                            padding: 4,
                            lineHeight: 1,
                        }}
                    >
                        ✕
                    </button>
                </div>

                {!imageSrc ? (
                    /* Step 1: Browse / Drag & Drop Dropzone */
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        style={{
                            border: `2px dashed ${isDragging ? 'var(--color-accent, #f97316)' : 'var(--color-border, #475569)'}`,
                            background: isDragging ? 'rgba(249, 115, 22, 0.08)' : 'var(--color-bg, #0f172a)',
                            borderRadius: 16,
                            padding: '48px 24px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 16,
                        }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                background: 'rgba(249, 115, 22, 0.15)',
                                color: 'var(--color-accent, #f97316)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 28,
                            }}
                        >
                            📸
                        </div>
                        <div>
                            <h4 style={{ margin: '0 0 6px 0', fontSize: 16, fontWeight: 600 }}>
                                Drag & Drop your food photo here
                            </h4>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary, #94a3b8)' }}>
                                Supports JPEG, PNG, WEBP files up to 10MB
                            </p>
                        </div>

                        <button
                            type="button"
                            style={{
                                padding: '10px 20px',
                                borderRadius: 10,
                                background: 'var(--color-accent, #f97316)',
                                color: '#fff',
                                border: 'none',
                                fontWeight: 600,
                                fontSize: 14,
                                cursor: 'pointer',
                                marginTop: 8,
                            }}
                        >
                            Browse Photo File
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                            style={{ display: 'none' }}
                        />
                    </div>
                ) : (
                    /* Step 2: Interactive Photo Editor */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Interactive Canvas */}
                        <div
                            style={{
                                position: 'relative',
                                borderRadius: 14,
                                overflow: 'hidden',
                                border: '1px solid var(--color-border, #334155)',
                                background: '#111827',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: isMouseDown ? 'grabbing' : 'grab',
                                userSelect: 'none',
                            }}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <canvas
                                ref={canvasRef}
                                width={540}
                                height={360}
                                style={{ width: '100%', maxHeight: 360, display: 'block', objectFit: 'contain' }}
                            />
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: 10,
                                    left: 12,
                                    background: 'rgba(0, 0, 0, 0.65)',
                                    color: '#fff',
                                    padding: '4px 10px',
                                    borderRadius: 6,
                                    fontSize: 12,
                                    pointerEvents: 'none',
                                }}
                            >
                                💡 Tip: Click & drag image to position food
                            </div>
                        </div>

                        {/* Editing Toolbars */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Aspect Ratio Presets */}
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--color-text-secondary, #94a3b8)' }}>
                                    CROP ASPECT RATIO
                                </label>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {ASPECT_RATIOS.map((ratio) => (
                                        <button
                                            key={ratio.label}
                                            type="button"
                                            onClick={() => setAspectRatio(ratio.value)}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: 8,
                                                border: aspectRatio === ratio.value ? '2px solid var(--color-accent, #f97316)' : '1px solid var(--color-border, #475569)',
                                                background: aspectRatio === ratio.value ? 'rgba(249, 115, 22, 0.2)' : 'var(--color-surface-2, #334155)',
                                                color: aspectRatio === ratio.value ? 'var(--color-accent, #f97316)' : 'var(--color-text-primary, #fff)',
                                                fontSize: 13,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {ratio.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Rotation, Zoom & Flip Controls */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--color-text-secondary, #94a3b8)' }}>
                                        ROTATION & FLIP
                                    </label>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            type="button"
                                            onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                                            style={{
                                                flex: 1,
                                                padding: '8px 12px',
                                                borderRadius: 8,
                                                border: '1px solid var(--color-border, #475569)',
                                                background: 'var(--color-surface-2, #334155)',
                                                color: 'var(--color-text-primary, #fff)',
                                                fontSize: 13,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            ↺ 90° Left
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRotation((prev) => (prev + 90) % 360)}
                                            style={{
                                                flex: 1,
                                                padding: '8px 12px',
                                                borderRadius: 8,
                                                border: '1px solid var(--color-border, #475569)',
                                                background: 'var(--color-surface-2, #334155)',
                                                color: 'var(--color-text-primary, #fff)',
                                                fontSize: 13,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            ↻ 90° Right
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFlipH((prev) => !prev)}
                                            style={{
                                                padding: '8px 14px',
                                                borderRadius: 8,
                                                border: flipH ? '2px solid var(--color-accent, #f97316)' : '1px solid var(--color-border, #475569)',
                                                background: flipH ? 'rgba(249, 115, 22, 0.2)' : 'var(--color-surface-2, #334155)',
                                                color: flipH ? 'var(--color-accent, #f97316)' : 'var(--color-text-primary, #fff)',
                                                fontSize: 13,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            ↔ Flip
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary, #94a3b8)' }}>
                                            ZOOM
                                        </label>
                                        <span style={{ fontSize: 12, color: 'var(--color-text-muted, #94a3b8)' }}>
                                            {Math.round(zoom * 100)}%
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min={1}
                                        max={3}
                                        step={0.05}
                                        value={zoom}
                                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                                        style={{ width: '100%', accentColor: 'var(--color-accent, #f97316)' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Error message banner */}
                        {uploadError && (
                            <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>
                                ⚠️ {uploadError}
                            </div>
                        )}

                        {/* Bottom Actions */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 16, borderTop: '1px solid var(--color-border, #334155)' }}>
                            <button
                                type="button"
                                disabled={uploading}
                                onClick={() => setImageSrc(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-text-secondary, #94a3b8)',
                                    fontSize: 13,
                                    cursor: uploading ? 'not-allowed' : 'pointer',
                                    textDecoration: 'underline',
                                }}
                            >
                                ← Choose Different File
                            </button>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button
                                    type="button"
                                    disabled={uploading}
                                    onClick={handleClose}
                                    style={{
                                        padding: '10px 18px',
                                        borderRadius: 10,
                                        border: '1px solid var(--color-border, #475569)',
                                        background: 'transparent',
                                        color: 'var(--color-text-primary, #fff)',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: uploading ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={uploading}
                                    onClick={handleCropSubmit}
                                    style={{
                                        padding: '10px 24px',
                                        borderRadius: 10,
                                        border: 'none',
                                        background: 'var(--color-accent, #f97316)',
                                        color: '#fff',
                                        fontSize: 14,
                                        fontWeight: 700,
                                        cursor: uploading ? 'not-allowed' : 'pointer',
                                        opacity: uploading ? 0.7 : 1,
                                        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                    }}
                                >
                                    {uploading ? (
                                        <>
                                            <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                            Uploading to Cloudinary...
                                        </>
                                    ) : (
                                        'Submit Photo'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ImageUploadModal;
