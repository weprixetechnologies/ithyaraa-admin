import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

const ImageUpload = ({ maxImages = 5, placeholder, prefilledImages = [] }, ref) => {
    const [oldImages, setOldImages] = useState(prefilledImages); // Existing URLs
    const [newImages, setNewImages] = useState([]); // New File objects

    useEffect(() => {
        if (prefilledImages?.length > 0) {
            setOldImages(prefilledImages);
        }
    }, [prefilledImages]);


    useImperativeHandle(ref, () => ({
        uploadImagetoDatabase: async () => {
            console.log('Uploading new images only...');

            const uploadedUrls = await Promise.all(
                newImages.map((file) => fakeUpload(file))
            );

            const finalUrls = [...oldImages, ...uploadedUrls].map((url) => ({
                imgUrl: url,
                imgAlt: '' // You can enhance this to collect alt text
            }));

            console.log('📦 Final Image URLs:', finalUrls);
            return finalUrls;
        }
    }));

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const combined = [...oldImages, ...newImages, ...files];

        // Cut down to maxImages
        const remainingSlots = maxImages - oldImages.length;
        const selected = [...newImages, ...files].slice(0, remainingSlots);

        setNewImages(selected);
    };

    const handleRemoveImage = (index, isOld) => {
        if (isOld) {
            const updated = [...oldImages];
            updated.splice(index, 1);
            setOldImages(updated);
        } else {
            const updated = [...newImages];
            updated.splice(index, 1);
            setNewImages(updated);
        }
    };

    const fakeUpload = (file) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const url = URL.createObjectURL(file); // Simulate storage URL
                resolve(url);
            }, 1000);
        });
    };

    const totalCount = oldImages.length + newImages.length;

    return (
        <div className="imageupload-wrapper">
            {/* 🖼️ Preview Old */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {oldImages.map((url, idx) => (
                    <img
                        key={`old-${idx}`}
                        src={url.imgUrl}
                        alt={`old-preview-${idx}`}
                        width={100}
                        height={100}
                        style={{ objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }}
                        onClick={() => handleRemoveImage(idx, true)}
                        title="Click to remove"
                    />
                ))}
                {/* 🖼️ Preview New */}
                {newImages.map((file, idx) => (
                    <img
                        key={`new-${idx}`}
                        src={URL.createObjectURL(file)}
                        alt={`new-preview-${idx}`}
                        width={100}
                        height={100}
                        style={{ objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }}
                        onClick={() => handleRemoveImage(idx, false)}
                        title="Click to remove"
                    />
                ))}
            </div>

            {/* 📤 Upload Button */}
            <label>
                <p className='placeholder-text--ap-upload-image'>{placeholder}</p>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    disabled={totalCount >= maxImages}
                />
            </label>

            {totalCount >= maxImages && (
                <p style={{ color: 'red', marginTop: '10px' }}>Maximum {maxImages} images allowed.</p>
            )}
        </div>
    );
};

export default forwardRef(ImageUpload);
