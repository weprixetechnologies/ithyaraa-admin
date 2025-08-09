import React, { useState, useEffect } from 'react';
import './sidebar.css'
import logo from './../assets/ithyaraa-logo.png'
import { FiChevronRight, FiChevronDown } from 'react-icons/fi';
import { RiDashboardFill } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom';
import { mainMenu } from './menus';



const SidebarMenu = ({ keymenu, activeMenu }) => {
    const [openMenu, setOpenMenu] = useState(null);
    const navigate = useNavigate();

    const navigation = (link) => {
        navigate(link);
    };

    useEffect(() => {
        const matched = keymenu.find(menu =>
            menu.menuID === activeMenu ||
            menu.subMenu?.some(sub => sub.menuID === activeMenu)
        );
        if (matched) setOpenMenu(matched.id);
    }, [activeMenu, keymenu]);

    const handleToggle = (menu) => {
        if (menu.subMenu && menu.subMenu?.length > 0) {
            // Toggle submenu (open/close)
            setOpenMenu(prev => (prev === menu.id ? null : menu.id));
        } else {
            navigation(menu.url); // Navigate if no submenu
        }
    };


    return (
        <div className='sidebar--component'>
            {keymenu?.map((menu) => {
                const isParentActive =
                    menu.menuID === activeMenu ||
                    menu.subMenu?.some(sub => sub.menuID === activeMenu);

                return (
                    <div key={menu.menuID} className='menu-item'>
                        <div
                            className={`border menu-title ${isParentActive ? 'active-menu' : ''}`}
                            onClick={() => handleToggle(menu)}
                        >
                            <div className="left">
                                <span className="icon">
                                    {menu.icon ? menu.icon : <RiDashboardFill />}
                                </span>
                                <span className="text-menu">{menu.title}</span>
                            </div>
                            {menu.subMenu?.length > 0 && (
                                <div className="right">
                                    {openMenu === menu.id ? <FiChevronDown /> : <FiChevronRight />}
                                </div>
                            )}
                        </div>

                        {openMenu === menu.id && menu.subMenu?.length > 0 && (
                            <div className="submenu">
                                {menu.subMenu?.map((sub) => (
                                    <div
                                        key={sub.menuID}
                                        className={`submenu-item ${activeMenu === sub.menuID ? 'active-submenu' : ''}`}
                                        onClick={() => navigation(sub.url)}
                                    >
                                        <span className="icon">{sub.icon}</span>
                                        <span className="text">{sub.title}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};



const Sidebar = ({ activeMenu }) => {


    return (
        <aside className='sidebar'>
            <div className="logo-sidebar">
                <img src={logo} alt="logo" />
            </div>
            <div className="greet-user">
                <p className='welcome-text-gu'>Welcome Back</p>
                <p className='welcome-name'>Deepak Muttaluru Iyer!</p>
            </div>

            <div className="sidebar-menu">
                <p className='sidebar-p'>Main</p>
                <SidebarMenu keymenu={mainMenu} activeMenu={activeMenu} />


            </div>
            <div className="bottom-sidebar">
                <button className='primary-button-gta'>Go to Admin</button>
                <button className='logout-button'>Logout</button>

            </div>
        </aside>
    );
};


export default Sidebar