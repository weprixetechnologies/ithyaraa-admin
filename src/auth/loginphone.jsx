//working code

import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
    RecaptchaVerifier,
    signInWithPhoneNumber
} from 'firebase/auth';

const PhoneLogin = () => {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);

    useEffect(() => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
                callback: () => {
                    console.log('reCAPTCHA solved ✅');
                },
                'expired-callback': () => {
                    console.warn('reCAPTCHA expired, reset required');
                }
            });
            window.recaptchaVerifier.render();
        }
    }, []);

    const sendOtp = async () => {
        const appVerifier = window.recaptchaVerifier;
        try {
            const result = await signInWithPhoneNumber(auth, phone, appVerifier);
            setConfirmationResult(result);
            alert('OTP sent 📩');
        } catch (error) {
            console.error('Error sending OTP:', error.message);
            alert('Failed to send OTP. Check number or try again.');
        }
    };

    const verifyOtp = async () => {
        try {
            const res = await confirmationResult.confirm(otp);
            console.log('User signed in ✅', res.user);
            alert('Login Successful 🎉');
        } catch (err) {
            console.error('OTP verification failed ❌', err.message);
            alert('Incorrect OTP!');
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>📱 Phone Login</h2>
            <input
                type="tel"
                placeholder="+91 XXXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ padding: 10, width: 250 }}
            />
            <button onClick={sendOtp} style={{ marginLeft: 10 }}>Send OTP</button>

            {confirmationResult && (
                <>
                    <br /><br />
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        style={{ padding: 10, width: 250 }}
                    />
                    <button onClick={verifyOtp} style={{ marginLeft: 10 }}>Verify OTP</button>
                </>
            )}

            {/* Required for reCAPTCHA */}
            <div id="recaptcha-container"></div>
        </div>
    );
};

export default PhoneLogin;
