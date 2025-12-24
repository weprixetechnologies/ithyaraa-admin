import React, { useState, useEffect } from 'react';
import SelectProducts from '@/components/ui/selectProducts';

const CrossSellModal = ({ isOpen, onClose, onSave, initialSelected = [] }) => {
    const [selectedProductIDs, setSelectedProductIDs] = useState(initialSelected);

    // Sync with initialSelected whenever it changes or modal opens
    useEffect(() => {
        if (isOpen && initialSelected) {
            setSelectedProductIDs(initialSelected);
        }
    }, [isOpen, initialSelected]);

    const handleProductToggle = (productID) => {
        setSelectedProductIDs(prev => {
            const isSelected = prev.includes(productID);
            return isSelected
                ? prev.filter(id => id !== productID)
                : [...prev, productID];
        });
    };

    const handleSave = () => {
        onSave(selectedProductIDs);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0  flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col m-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">Select Cross-Sell Products</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <SelectProducts
                        onProductToggle={handleProductToggle}
                        initialSelected={selectedProductIDs}
                    />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t bg-gray-50">
                    <div className="text-sm text-gray-600">
                        <strong>{selectedProductIDs.length}</strong> product{selectedProductIDs.length !== 1 ? 's' : ''} selected
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Save Selection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrossSellModal;

