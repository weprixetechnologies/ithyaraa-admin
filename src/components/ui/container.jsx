import React from 'react'
import './ui-component.css'

const Container = ({ title, children }) => {
    return (
        <div className='container--react'>
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