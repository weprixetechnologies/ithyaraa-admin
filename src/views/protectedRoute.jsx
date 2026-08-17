import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCookie } from './../lib/cookieUtil'; // adjust path as needed

const ProtectedRoute = ({ children, allowedRoles }) => {
    const isLoggedIn = getCookie('_iil') === 'true';
    const userRole = getCookie('_role') || 'admin';

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // User is logged in but doesn't have permission for this route
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
