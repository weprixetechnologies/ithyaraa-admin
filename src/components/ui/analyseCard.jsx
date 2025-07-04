import React from 'react';
import './AnalyseCard.css';

const AnalyseCard = ({ title, count, growth, since, improves, Icon }) => {
    return (
        <div className="analyse-card">
            <div className="analyse-card-header">
                <p className="analyse-title">{title}</p>
                <div className="analyse-icon">
                    {Icon && <Icon size={20} />}
                </div>
            </div>

            <h2 className="analyse-count">{count.toLocaleString()}</h2>

            <div className="analyse-growth">
                <span className={`growth-badge ${improves ? 'growth-negative' : ''}`}>
                    ↑ {growth.toLocaleString()}
                </span>
                <span className="since-label">Since {since}</span>
            </div>
        </div>
    );
};

export default AnalyseCard;
