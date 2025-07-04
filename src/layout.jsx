import React from 'react'
import './global.css'
import Sidebar from './components/sidebar'
import TopbarLayout from './components/topbar_layout'

const Layout = ({ title, children, active }) => {
    return (
        <div className="layout-ds">
            <div className="auto-adjusting--sidebar">
                <Sidebar activeMenu={active} />
            </div>
            <div className="website-fullcontent">
                <TopbarLayout title={title} />
                <div className="website-fullcontent-children">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Layout