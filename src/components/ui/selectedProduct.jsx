import React from 'react';
import './selectedProductList.css';

const SelectedProductList = ({ selectedProducts, onRemove }) => {
    if (selectedProducts.length === 0) {
        return <div className="selected-wrapper">No products selected.</div>;
    }

    return (
        <div className="selected-wrapper">
            <h3>Selected Products ({selectedProducts.length})</h3>
            <div className="selected-list">
                {selectedProducts.map((product) => (
                    <div key={product.productId} className="selected-item">
                        <img src={product.featuredImage.imgUrl} alt={product.productName} />
                        <div className="selected-info">
                            <p className="pname">{product.productName}</p>
                            <p className="psku">{product.categoryName}</p>
                            <p className="price">$ {product.regularPrice}</p>
                        </div>
                        <button
                            className="remove-btn"
                            onClick={() => onRemove(product.productId)}
                            title="Remove Product"
                        >
                            ❌
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SelectedProductList;
