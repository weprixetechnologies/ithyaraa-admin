import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCookie } from './../lib/cookieUtil'; // adjust path as needed

const ProtectedRoute = ({ children }) => {
    const isLoggedIn = getCookie('_iil') === 'true';

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
