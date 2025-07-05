import React, { useState, forwardRef, useImperativeHandle } from 'react';

const ImageUpload = ({ maxImages = 5, placeholder }, ref) => {
    const [images, setImages] = useState([]);

    // 📤 Function exposed to parent
    useImperativeHandle(ref, () => ({
        uploadImagetoDatabase: async () => {
            console.log('Uploading images...');

            const uploadedUrls = await Promise.all(
                images?.map((img) => fakeUpload(img))
            );

            console.log('Uploaded URLs:', uploadedUrls);
            return uploadedUrls;
        }
    }));

    // 🧠 Preview only - no upload on select
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const selected = [...images, ...files].slice(0, maxImages);
        setImages(selected);
    };

    // ❌ Remove image on click
    const handleRemoveImage = (index) => {
        const updated = [...images];
        updated.splice(index, 1);
        setImages(updated);
    };

    // 🧪 Simulated async upload (replace with Firebase later)
    const fakeUpload = (file) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const url = URL.createObjectURL(file);
                resolve(url);
            }, 1000);
        });
    };

    return (
        <div className="imageupload-wrapper">
            {/* 🖼️ Preview */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {images?.map((img, idx) => (
                    <img
                        key={idx}
                        src={URL.createObjectURL(img)}
                        alt={`preview-${idx}`}
                        width={100}
                        height={100}
                        style={{ objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }}
                        onClick={() => handleRemoveImage(idx)}
                        title="Click to remove"
                    />
                ))}
            </div>

            {/* 📤 File Upload */}
            <label >
                <p className='placeholder-text--ap-upload-image'>{placeholder}</p>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    disabled={images?.length >= maxImages}
                />
            </label>

            {images?.length >= maxImages && (
                <p style={{ color: 'red', marginTop: '10px' }}>Maximum {maxImages} images allowed.</p>
            )}
        </div>
    );
};

export default forwardRef(ImageUpload);
