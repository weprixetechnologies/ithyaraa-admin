import InputUi from '@/components/ui/inputui';
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: '',
    });

    const handleChange = (field, value) => {
        setLoginForm(prev => ({ ...prev, [field]: value }));
    };

    const handleLogin = async () => {
        if (!loginForm.email || !loginForm.password) {
            toast.warn('Fill Credentials')
            return;
        }

        try {
            const response = await axios.get('http://localhost:3300/api/auth', loginForm)
            console.log('Login success:', response.data);
        } catch (error) {
            console.error('Login failed:', error.response?.data || error.message);
            toast.error(error.message)
        }
    };

    return (
        <div className="flex-center bg-[#0a0a0a] w-[100dvw] h-[100dvh]">
            <div className="py-7 px-7 min-w-[400px] bg-dark-text border border-secondary-text rounded-[12px] text-white">
                <p className="font-semibold text-lg" style={{ fontFamily: 'var(--f2)' }}>
                    Login to your account
                </p>
                <p className="text-sm text-secondary-primary mb-[15px]">
                    Please Enter Your Credentials to Login
                </p>

                <div className="flex flex-col gap-2">
                    <div>
                        <InputUi fieldClass={'text-black'}
                            label={'Email Address'}
                            labelClassp="text-white text-[14px]"
                            value={loginForm.email}
                            datafunction={e => handleChange('email', e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col items-end w-full">
                        <InputUi fieldClass={'text-black'}
                            label={'Password'}
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
                        className="w-full border-none bg-light-grey py-2 text-black rounded-[10px] flex-center text-md hover:bg-white"
                    >
                        Login Securely
                    </button>
                    <p className="text-sm text-light-grey">
                        Don't Have Account? <a href="/" className="underline">Create One</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
