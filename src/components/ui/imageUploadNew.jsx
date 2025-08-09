import React, {
    useRef,
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle
} from 'react';

const UploadImagesNew = forwardRef(
    ({ maxImages = 5, defaultImages = [], providedName = 'images' }, ref) => {
        const fileInputRef = useRef(null);
        const [oldImages, setOldImages] = useState([]);
        const [newImages, setNewImages] = useState([]);

        // BunnyCDN config
        const storageZone = 'ithyaraa';
        const storageRegion = 'sg.storage.bunnycdn.com';
        const pullZoneUrl = 'https://ithyaraa.b-cdn.net';
        const apiKey = '7017f7c4-638b-48ab-add3858172a8-f520-4b88'; // ⚠️ Dev-only key

        // Upload a single file to BunnyCDN
        const uploadToBunny = async (file) => {
            const fileName = encodeURIComponent(file.name);
            const uploadUrl = `https://${storageRegion}/${storageZone}/${fileName}`;
            const publicUrl = `${pullZoneUrl}/${fileName}`;

            const res = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    AccessKey: apiKey,
                    'Content-Type': file.type,
                },
                body: file,
            });

            if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
            return { imgUrl: publicUrl, imgAlt: file.name };
        };

        // Expose public methods to parent via ref
        useImperativeHandle(ref, () => ({
            openUploadDialog: () => fileInputRef.current?.click(),

            reset: () => {
                setOldImages([]);
                setNewImages([]);
            },

            uploadImageFunction: async () => {
                const finalImages = [];

                // Push already uploaded old images
                for (const img of oldImages) {
                    finalImages.push({ imgUrl: img.imgUrl, imgAlt: img.imgAlt });
                }

                // Upload new images
                for (const img of newImages) {
                    if (!img.isUploaded && img.file) {
                        try {
                            const uploaded = await uploadToBunny(img.file);
                            finalImages.push(uploaded);
                        } catch (err) {
                            console.error(`Error uploading ${img.imgAlt}:`, err);
                        }
                    }
                }

                return finalImages;
            },
        }));

        // Format and set default (old) images on mount
        useEffect(() => {
            if (defaultImages?.length) {
                const formatted = defaultImages.map((img, i) => ({
                    imgUrl: typeof img === 'string' ? img : img.imgUrl,
                    imgAlt: img?.imgAlt || `image-${i + 1}`,
                }));
                setOldImages(formatted);
            }
        }, [defaultImages]);

        // Handle new image selection
        const handleFilesChange = (e) => {
            const files = Array.from(e.target.files);
            const availableSlots = maxImages - oldImages.length - newImages.length;
            const selected = files.slice(0, availableSlots);

            const newUploads = selected.map((file) => ({
                imgUrl: URL.createObjectURL(file),
                imgAlt: file.name,
                isUploaded: false,
                file,
            }));

            setNewImages((prev) => [...prev, ...newUploads]);
        };

        // Remove image from state
        const handleRemoveImage = (index, isOld) => {
            if (!window.confirm('Are you sure you want to remove this image?')) return;

            if (isOld) {
                setOldImages((prev) => prev.filter((_, i) => i !== index));
            } else {
                setNewImages((prev) => prev.filter((_, i) => i !== index));
            }
        };

        const allImages = [...oldImages, ...newImages];

        return (
            <div className="w-full">
                {/* Upload Box */}
                <div
                    className={`flex flex-col items-center justify-center h-20 border-dashed border-blue-500 w-full border rounded-lg cursor-pointer 
                        ${allImages.length >= maxImages ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <p className="text-blue-500">
                        {allImages.length >= maxImages
                            ? 'Max images uploaded'
                            : 'Click to Upload Image'}
                    </p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFilesChange}
                />

                {/* Image Preview List */}
                <div className="flex gap-2 mt-4 flex-wrap">
                    {allImages.map((img, i) => (
                        <div
                            key={i}
                            className="w-24 h-24 border rounded overflow-hidden relative group cursor-pointer"
                            onClick={() =>
                                handleRemoveImage(
                                    i < oldImages.length ? i : i - oldImages.length,
                                    i < oldImages.length
                                )
                            }
                        >
                            <img
                                src={img.imgUrl}
                                alt={img.imgAlt}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition-opacity">
                                Click to Remove
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
);

export default UploadImagesNew;
