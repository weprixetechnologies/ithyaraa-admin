import React from 'react'
import './ui-component.css'

const Container = ({ title, children, classContainer, gap }) => {
    return (
        <div className={`container--react ${classContainer}`} style={{ gap: `${gap}px` }}>
            <div className="top-container--react">
                <p>{title}</p>
                <hr className="custom-hr" />
            </div>
            {
                children
            }
        </div>
    )
}

export default Container