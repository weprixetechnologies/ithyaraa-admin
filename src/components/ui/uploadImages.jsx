import React, {
    useRef,
    useState,
    useEffect,
    useImperativeHandle,
    forwardRef
} from 'react';

const UploadImages = forwardRef(
    (
        {
            maxImages = 5,
            defaultImages = [],
            providedName = 'images'
        },
        ref
    ) => {
        const fileInputRef = useRef(null);
        const [images, setImages] = useState([]);

        const storageZone = 'ithyaraa';
        const storageRegion = 'sg.storage.bunnycdn.com';
        const pullZoneUrl = 'https://ithyaraa.b-cdn.net';
        const apiKey = '7017f7c4-638b-48ab-add3858172a8-f520-4b88'; // ⚠️ Only for dev/test

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

            if (!res.ok) {
                throw new Error(`Upload failed: ${res.status}`);
            }

            return {
                imgUrl: publicUrl,
                imgAlt: file.name
            };
        };

        useImperativeHandle(ref, () => ({
            openUploadDialog: () => {
                fileInputRef.current?.click();
            },

            uploadImageFunction: async () => {
                const uploaded = [];

                for (const img of images) {
                    if (img.isOld || img.isUploaded) {
                        uploaded.push({ imgUrl: img.imgUrl, imgAlt: img.imgAlt });
                        console.log('Pushing Old');
                    } else if (img.file) {
                        try {
                            const uploadedUrl = await uploadToBunny(img.file);
                            uploaded.push(uploadedUrl);
                            console.log('Pushing New');
                        } catch (err) {
                            console.error(`Failed uploading ${img.imgAlt}:`, err);
                        }
                    }
                }

                console.log(uploaded);

                // ✅ Don't use `await` here — `map` is synchronous
                const updated = images.map((img) => {
                    const match = uploaded.find((u) => u.imgAlt === img.imgAlt);
                    if (match) {
                        return {
                            ...img,
                            imgUrl: match.imgUrl,
                            isUploaded: true
                        };
                    }
                    return img;
                });

                console.log('update', updated);

                setImages(updated);

                return uploaded;
            }

        }));

        useEffect(() => {
            if (defaultImages.length > 0) {
                const formatted = defaultImages.map((img, i) => ({
                    imgUrl: typeof img === 'string' ? img : img.imgUrl,
                    imgAlt: img.imgAlt || `image-${i + 1}`,
                    isOld: true
                }));
                setImages(formatted);
            }
        }, []);

        const handleFilesChange = (e) => {
            const files = Array.from(e.target.files);
            const availableSlots = maxImages - images.length;
            const selected = files.slice(0, availableSlots);

            const localPreviews = selected.map((file) => ({
                imgUrl: URL.createObjectURL(file),
                imgAlt: file.name,
                isOld: false,
                isUploaded: false,
                file
            }));

            setImages((prev) => [...prev, ...localPreviews]);
        };

        const handleImageRemove = (index) => {
            if (window.confirm('Remove this image?')) {
                setImages((prev) => prev.filter((_, i) => i !== index));
            }
        };

        return (
            <div className="w-full">

                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center h-20 border-dashed border-blue-500 w-full border rounded-lg cursor-pointer ${images.length >= maxImages ? 'opacity-50 pointer-events-none' : ''
                        }`}
                >
                    <p className="text-blue-500">
                        {images.length >= maxImages
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
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className="w-24 h-24 border rounded overflow-hidden relative group cursor-pointer"
                            onClick={() => handleImageRemove(index)}
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

export default UploadImages;
