import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import InputUi from '@/components/ui/inputui';
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
                'http://localhost:3300/api/auth/login',
                loginForm,
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            const { accessToken, refreshToken } = response.data || {};
            console.log(refreshToken);

            if (!accessToken || !refreshToken) {
                throw new Error('Invalid login response');
            }

            console.log('Login success:', response.data);
            toast.success('Logged in successfully');

            // Store login state + tokens in cookies
            setCookie('isLoggedIn', 'true', 7); // 7 days
            setCookie('_at', accessToken, 7);
            setCookie('_rt', refreshToken, 7);

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
        <div className="flex-center bg-[#0a0a0a] w-[100dvw] h-[100dvh]">
            <div className="py-7 px-7 min-w-[400px] bg-dark-text border border-secondary-text rounded-[12px] text-white">
                <p className="font-semibold text-lg" style={{ fontFamily: 'var(--f2)' }}>
                    Login to your account
                </p>
                <p className="text-sm text-secondary-primary mb-[15px]">
                    Please enter your credentials to login
                </p>

                <div className="flex flex-col gap-2">
                    <InputUi
                        fieldClass="text-black"
                        label="Email Address"
                        labelClassp="text-white text-[14px]"
                        value={loginForm.email}
                        datafunction={e => handleChange('email', e.target.value)}
                    />

                    <div className="flex flex-col items-end w-full">
                        <InputUi
                            fieldClass="text-black"
                            label="Password"
                            labelClassp="text-white text-[14px]"
                            type="password"
                            value={loginForm.password}
                            datafunction={e => handleChange('password', e.target.value)}
                        />
                        <a href="/" className="text-sm text-light-grey underline">
                            Forgot Password
                        </a>
                    </div>
                </div>

                <div className="flex flex-col gap-2 justify-center items-center mt-7">
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className={`w-full border-none py-2 text-black rounded-[10px] flex-center text-md ${loading ? 'bg-gray-400' : 'bg-light-grey hover:bg-white'
                            }`}
                    >
                        {loading ? 'Logging in...' : 'Login Securely'}
                    </button>
                    <p className="text-sm text-light-grey">
                        Don't have an account? <a href="/" className="underline">Create One</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
