import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FiUpload, FiCheckCircle, FiLoader } from 'react-icons/fi';
import './ui-component.css'; // Ensure your styles are placed here

const ImageUpload = ({ maxImages = 5, placeholder = "Upload Image", prefilledImages = [], layout = 'simple' }, ref) => {
    const [oldImages, setOldImages] = useState(prefilledImages);
    const [newImages, setNewImages] = useState([]);
    const [status, setStatus] = useState('idle'); // 'idle', 'uploading', 'completed'

    useEffect(() => {
        if (prefilledImages?.length > 0) {
            setOldImages(prefilledImages);
        }
    }, [prefilledImages]);
    useImperativeHandle(ref, () => ({
        uploadImagetoDatabase: async () => {
            console.log('Uploading new images only...');

            const uploadedUrls = await Promise.all(
                newImages.map((file) => fakeUpload(file)) // returns string URLs
            );

            // Normalize uploaded new images to { imgUrl, imgAlt }
            const formattedNew = uploadedUrls.map((url) => ({
                imgUrl: url,
                imgAlt: ''
            }));

            // Normalize oldImages whether they are strings or objects
            const formattedOld = oldImages.map((item) =>
                typeof item === 'string'
                    ? { imgUrl: item, imgAlt: '' }
                    : {
                        imgUrl: item.imgUrl ?? '',
                        imgAlt: item.imgAlt ?? ''
                    }
            );

            const finalUrls = [...formattedOld, ...formattedNew];

            console.log('📦 Final Image URLs:', finalUrls);
            return finalUrls;
        },

        resetImages: () => {
            setOldImages([]);
            setNewImages([]);
        },
        setPrefilledImage: (input) => {
            let images = [];

            if (Array.isArray(input)) {
                // input is an array of strings or objects
                images = input.map(item => {
                    if (typeof item === 'string') {
                        return { imgUrl: item, imgAlt: '' };
                    }
                    return {
                        imgUrl: item.imgUrl || '',
                        imgAlt: item.imgAlt || ''
                    };
                });
            } else if (typeof input === 'string') {
                // input is a single URL string
                images = [{ imgUrl: input, imgAlt: '' }];
            } else if (typeof input === 'object' && input !== null) {
                // input is a single object
                images = [{
                    imgUrl: input.imgUrl || '',
                    imgAlt: input.imgAlt || ''
                }];
            }

            setOldImages(images);
            setNewImages([]);
        },
        appendPrefilledImage: (input) => {
            let images = [];

            if (Array.isArray(input)) {
                // input is an array of strings or objects
                images = input.map(item => {
                    if (typeof item === 'string') {
                        return { imgUrl: item, imgAlt: '' };
                    }
                    return {
                        imgUrl: item.imgUrl || '',
                        imgAlt: item.imgAlt || ''
                    };
                });
            } else if (typeof input === 'string') {
                // input is a single URL string
                images = [{ imgUrl: input, imgAlt: '' }];
            } else if (typeof input === 'object' && input !== null) {
                // input is a single object
                images = [{
                    imgUrl: input.imgUrl || '',
                    imgAlt: input.imgAlt || ''
                }];
            }

            setOldImages(prev => [...prev, ...images]);

        },
        removePrefilledImage: (input) => {
            let toRemove = [];

            if (Array.isArray(input)) {
                toRemove = input.map(item => {
                    if (typeof item === 'string') {
                        return item; // string URL
                    }
                    return item.imgUrl || '';
                });
            } else if (typeof input === 'string') {
                toRemove = [input];
            } else if (typeof input === 'object' && input !== null) {
                toRemove = [input.imgUrl || ''];
            }

            setOldImages(prev =>
                prev.filter(img => !toRemove.includes(img.imgUrl))
            );
        }

    }));


    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const remainingSlots = maxImages - (oldImages.length + newImages.length);
        const selected = files.slice(0, remainingSlots);
        setNewImages(prev => [...prev, ...selected]);
    };

    const handleRemoveImage = (index, isOld) => {
        if (isOld) {
            setOldImages(prev => prev.filter((_, i) => i !== index));
        } else {
            setNewImages(prev => prev.filter((_, i) => i !== index));
        }
    };
    const fakeUpload = (file) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const url = URL.createObjectURL(file);
                resolve(url);
            }, 4000); // ← if you're simulating 20 sec
        });
    };


    const totalCount = oldImages.length + newImages.length;

    const renderPreviewImages = () => (
        <div className="upload-preview">
            {oldImages.map((url, idx) => (
                <img
                    key={`old-${idx}`}
                    src={url.imgUrl}
                    alt={`old-preview-${idx}`}
                    className="upload-img"
                    onClick={() => handleRemoveImage(idx, true)}
                    title="Click to remove"
                />
            ))}
            {newImages.map((file, idx) => (
                <img
                    key={`new-${idx}`}
                    src={URL.createObjectURL(file)}
                    alt={`new-preview-${idx}`}
                    className="upload-img"
                    onClick={() => handleRemoveImage(idx, false)}
                    title="Click to remove"
                />
            ))}
        </div>
    );

    const renderUploadButton = () => (
        <label>
            {layout === 'simple' ? (
                <p className='placeholder-text--ap-upload-image'>{placeholder}</p>
            ) : (
                <div className="dashed-box">
                    <FiUpload size={28} />
                    <p>{placeholder}</p>
                </div>
            )}
            <input
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                disabled={totalCount >= maxImages}
            />
        </label>
    );

    const renderStatus = () => {
        switch (status) {
            case 'uploading':
                return (
                    <div className="upload-status uploading">
                        <FiLoader className="spin" />
                        <span>Uploading...</span>
                    </div>
                );
            case 'completed':
                return (
                    <div className="upload-status completed">
                        <FiCheckCircle />
                        <span>Completed</span>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`imageupload-wrapper layout-${layout}`}>
            {renderPreviewImages()}
            {renderUploadButton()}
            {renderStatus()}
            {totalCount >= maxImages && (
                <p style={{ color: 'red', marginTop: '10px' }}>
                    Maximum {maxImages} images allowed.
                </p>
            )}


        </div>
    );
};

export default forwardRef(ImageUpload);
