import React, { useState, useEffect } from 'react';
import './sidebar.css'; // Make sure this contains the styles
import { FiMaximize, FiMinimize } from 'react-icons/fi';
import { IoIosNotificationsOutline } from "react-icons/io";
import { CiLocationArrow1 } from "react-icons/ci";

const TopbarLayout = ({ title }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleToggleFullscreen = () => {
        const element = document.documentElement;

        if (!isFullscreen) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }

        setIsFullscreen(!isFullscreen);
    };

    useEffect(() => {
        const onFullScreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', onFullScreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullScreenChange);
    }, []);

    return (
        <section className="toplayout">
            <div className="top-title">
                <p>{title}</p>

            </div>
            <div className="right-top-layout">
                <button className="notification-tab u--c--rtb">
                    <IoIosNotificationsOutline />
                </button>
                <button className="go-fullscreen  u--c--rtb" onClick={handleToggleFullscreen}>
                    {isFullscreen ? <FiMinimize /> : <FiMaximize />}
                </button>
                <div className="profile-topbar ripple-container">
                    <p>Profile</p>
                    <button>
                        <CiLocationArrow1 />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default TopbarLayout;
