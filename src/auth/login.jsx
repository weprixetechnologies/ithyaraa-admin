import React from 'react'
import './auth.css'

const Login = () => {
    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h2>Welcome Back</h2>
                    <p>Login to access your dashboard</p>
                </div>
                <form className="login-form">
                    <label>
                        <span>Email Address</span>
                        <input type="email" placeholder="you@example.com" required />
                    </label>
                    <label>
                        <span>Password</span>
                        <input type="password" placeholder="Enter your password" required />
                    </label>
                    <button type="submit">Login</button>
                    <div className="login-footer">
                        <p>Don't have an account? <a href="/signup">Sign Up</a></p>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login
