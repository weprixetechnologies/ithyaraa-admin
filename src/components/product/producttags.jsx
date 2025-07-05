import React, { useState } from 'react';
import './productcomponent.css'

const ProductTags = () => {
    const [tags, setTags] = useState([]);
    const [input, setInput] = useState('');

    const addTag = () => {
        const trimmed = input.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setInput('');
        }
    };

    const removeTag = (indexToRemove) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    return (
        <div className="product-tags-wrapper">
            <div className="product-tags-input-container">
                {tags.map((tag, index) => (
                    <div key={index} className="product-tag-item">
                        <span className="product-tag-label">{tag}</span>
                        <span
                            className="product-tag-remove"
                            onClick={() => removeTag(index)}
                        >
                            ×
                        </span>
                    </div>
                ))}
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a tag"
                    className="product-tag-input"
                />
            </div>
            <button onClick={addTag} className="product-tag-add-button">
                Add Tag
            </button>
        </div>
    );
};

export default ProductTags;
