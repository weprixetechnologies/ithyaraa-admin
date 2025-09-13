import React, {
    useRef,
    useState,
    useEffect,
    useImperativeHandle,
    forwardRef
} from 'react';
const UploadImages = forwardRef(
    ({ maxImages = 5, defaultImages = [], providedName = 'images' }, ref) => {
        const fileInputRef = useRef(null);
        const [oldImages, setOldImages] = useState([]);
        const [newImages, setNewImages] = useState([]);

        const storageZone = 'ithyaraa';
        const storageRegion = 'sg.storage.bunnycdn.com';
        const pullZoneUrl = 'https://ithyaraa.b-cdn.net';
        const apiKey = '7017f7c4-638b-48ab-add3858172a8-f520-4b88'; // ⚠️ Dev only

        const uploadToBunny = async (file) => {
            const fileName = encodeURIComponent(file.name);
            const uploadUrl = `https://${storageRegion}/${storageZone}/${fileName}`;
            const publicUrl = `${pullZoneUrl}/${fileName}`;

            const res = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    AccessKey: apiKey,
                    'Content-Type': file.type
                },
                body: file
            });

            if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
            return { imgUrl: publicUrl, imgAlt: file.name };
        };

        useImperativeHandle(ref, () => ({
            openUploadDialog: () => fileInputRef.current?.click(),
            reset: () => {
                console.log('reseting');

                setOldImages([]);
                setNewImages([]);
            },
            uploadImageFunction: async () => {
                const uploaded = [];

                // Push old ones
                for (const img of oldImages) {
                    uploaded.push({ imgUrl: img.imgUrl, imgAlt: img.imgAlt });
                }
                console.log('Uploaded Old', uploaded);

                // Upload new ones
                for (const img of newImages) {
                    if (!img.isUploaded && img.file) {
                        try {
                            const uploadedUrl = await uploadToBunny(img.file);
                            uploaded.push(uploadedUrl);
                        } catch (err) {
                            console.error(`Failed uploading ${img.imgAlt}:`, err);
                        }
                    }
                }
                console.log('Uploaded New', uploaded);
                return uploaded;
            }
        }));

 useEffect(() => {
    if (!defaultImages?.length) return; // skip if undefined or empty

    const formatted = defaultImages
        .filter(img => img) // remove undefined/null items
        .map((img, i) => ({
            imgUrl: typeof img === 'string' ? img : img?.imgUrl || '', // fallback empty string
            imgAlt: img?.imgAlt || `image-${i + 1}`,
            isOld: true
        }));

    console.log('formatting', formatted);
    setOldImages(formatted);
}, [defaultImages]);



        const handleFilesChange = (e) => {
            const files = Array.from(e.target.files);
            const availableSlots = maxImages - oldImages.length - newImages.length;
            const selected = files.slice(0, availableSlots);

            const localPreviews = selected.map((file) => ({
                imgUrl: URL.createObjectURL(file),
                imgAlt: file.name,
                isOld: false,
                isUploaded: false,
                file
            }));

            setNewImages((prev) => [...prev, ...localPreviews]);
        };

        const handleImageRemove = (index, isOld) => {
            if (!window.confirm('Remove this image?')) return;
            if (isOld) {
                setOldImages((prev) => prev.filter((_, i) => i !== index));
            } else {
                setNewImages((prev) => prev.filter((_, i) => i !== index));
            }
        };

        const allImages = [...oldImages, ...newImages];

        return (
            <div className="w-full">
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center h-20 border-dashed border-blue-500 w-full border rounded-lg cursor-pointer ${allImages.length >= maxImages ? 'opacity-50 pointer-events-none' : ''
                        }`}
                >
                    <p className="text-blue-500">
                        {allImages.length >= maxImages
                            ? 'Max images uploaded'
                            : 'Click to Upload Image'}
                    </p>
                </div>

                <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFilesChange}
                    className="hidden"
                />

                <div className="flex gap-2 mt-4 flex-wrap">
                    {allImages.map((img, index) => (
                        <div
                            key={index}
                            className="w-24 h-24 border rounded overflow-hidden relative group cursor-pointer"
                            onClick={() =>
                                handleImageRemove(
                                    index < oldImages.length ? index : index - oldImages.length,
                                    index < oldImages.length
                                )
                            }
                        >
                            <img
                                src={img.imgUrl || ''}
                                alt={img.imgAlt || 'Loading...'}
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

export default UploadImages;
