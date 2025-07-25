import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import './auth.css';

const Login = () => {
    const navigate = useNavigate();
    const auth = getAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/'); // redirect on success
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h2>Welcome Back</h2>
                    <p>Login to access your dashboard</p>
                </div>
                <form className="login-form" onSubmit={handleSubmit}>
                    <label>
                        <span>Email Address</span>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        <span>Password</span>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </label>
                    {error && <p className="error-text">{error}</p>}
                    <button type="submit">Login</button>
                    <div className="login-footer">
                        <p>Don't have an account? <a href="/signup">Sign Up</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
