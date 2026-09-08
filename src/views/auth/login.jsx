import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
// import InputUi from '@/components/ui/inputui';
import { getCookie, setCookie } from '../../lib/cookieUtil'
const Login = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const accessToken = getCookie('_at');
        const refreshToken = getCookie('_rt');
        const isLoggedIn = getCookie('_iil');
        if (accessToken && refreshToken && isLoggedIn === 'true') {
            navigate('/');
        }
    }, [navigate]);


    const [loginForm, setLoginForm] = useState({
        email: '',
        password: '',
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);


    const handleChange = (field, value) => {
        setLoginForm(prev => ({ ...prev, [field]: value }));
    };

    const handleLogin = async () => {
        if (!loginForm.email || !loginForm.password) {
            toast.warn('Fill in all credentials');
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                'https://backend.ithyaraa.com/api/auth/login',
                loginForm,
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            const { accessToken, refreshToken, user } = response.data || {};
            console.log(refreshToken);

            if (!accessToken || !refreshToken) {
                throw new Error('Invalid login response');
            }

            console.log('Login success:', response.data);
            // toast.success('Logged in successfully');

            // Store login state + tokens in cookies
            setCookie('_iil', 'true', 7); // 7 days
            setCookie('_at', accessToken, 7);
            setCookie('_rt', refreshToken, 7);
            if (user?.role) {
                setCookie('_role', user.role, 7);
            }

            navigate('/');

        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Login failed';
            console.error('Login failed:', message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="export-wrapper" style={{ width: '100vw', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
            <div className="login-layout">
                <div className="branding-panel">
                    <img
                        className="branding-image"
                        src="https://storage.googleapis.com/banani-generated-images/generated-images/8acc6179-c810-4acf-8501-6a563af02589.jpg"
                        alt="Admin background"
                    />
                    <div className="branding-content logo">
                        <div className="logo-icon">
                            <span style={{ fontWeight: 700 }}>A</span>
                        </div>
                        AdminPortal
                    </div>
                    <div className="branding-content testimonial">
                        <div className="testimonial-text">
                            "The new administrative dashboard has completely transformed how
                            we manage our internal infrastructure and user permissions."
                        </div>
                        <div className="testimonial-author">Sarah Jenkins</div>
                        <div className="testimonial-role">Director of Operations, TechCorp</div>
                    </div>
                </div>

                <div className="form-panel">
                    <div className="form-container">
                        <div className="form-header">
                            <h1 className="form-title">Welcome back</h1>
                            <p className="form-subtitle">
                                Please enter your credentials to access the admin portal.
                            </p>
                        </div>

                        <div className="form-group">
                            <div className="input-wrapper">
                                <label className="input-label">Work Email</label>
                                <input
                                    type="email"
                                    className="simulated-input"
                                    placeholder="admin@company.com"
                                    value={loginForm.email}
                                    onChange={e => handleChange('email', e.target.value)}
                                />
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">Password</label>
                                <div className="simulated-input with-icon">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="password-input"
                                        value={loginForm.password}
                                        onChange={e => handleChange('password', e.target.value)}
                                        placeholder="••••••••••••"
                                    />
                                    <div
                                        className="input-icon-right cursor-pointer"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <FaEyeSlash style={{ color: 'var(--muted-foreground)' }} />
                                        ) : (
                                            <FaEye style={{ color: 'var(--muted-foreground)' }} />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="form-options">
                                <div className="checkbox-wrapper">
                                    <div className="simulated-checkbox" />
                                    <span className="checkbox-label">Remember for 30 days</span>
                                </div>
                                <button
                                    type="button"
                                    className="forgot-link"
                                    onClick={() => navigate('/')}
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogin}
                                disabled={loading}
                                className="submit-btn"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </div>

                        <div className="divider">
                            <span className="divider-text">Or continue with</span>
                        </div>

                        <button type="button" className="sso-btn">
                            <span className="sso-btn-icon" style={{ width: 18, height: 18 }}>
                                <span style={{ fontSize: 12 }}>G</span>
                            </span>
                            Single Sign-On (SSO)
                        </button>

                        <p className="footer-text">
                            By signing in, you agree to our{' '}
                            <span className="footer-link">Terms of Service</span> and{' '}
                            <span className="footer-link">Privacy Policy</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
