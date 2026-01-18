import React, { useEffect, useState } from 'react';
import DefaultInput from '../../component/Form/DefaultInput';
import DefaultButton from '../../component/Buttons/DefaultButton';
import { useNavigate } from 'react-router-dom';
import Toast from '../../component/Toast/Toast';
import useForm from '../../hooks/useForm';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const EnrollMFA = () => {
    const navigate = useNavigate();
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const login = useAuth()
    const { values, handleChange } = useForm({ otp: '' });
    const [mfaToken, setMfaToken] = useState(null);


    useEffect(() => {
        localStorage.removeItem("otptoken");
        const token = localStorage.getItem("mfaToken");
        if (!token) {
            navigate("/", { replace: true });
            return;
        }
        setMfaToken(token);
    }, [navigate]);


    useEffect(() => {
        if (!mfaToken) return;

        const fetchEnrollState = async () => {
            try {
                const res = await API.post(
                    "/auth/mfa/enroll",
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${mfaToken}`,
                        }
                    }
                );

                if (res.data.qrCode) {
                    setQrCode(res.data.qrCode);
                } else {
                    setQrCode(null);
                }

            } catch (err) {
                console.error("MFA enroll fetch error:", err.response?.data || err.message);
                navigate("/", { replace: true });
            }
        };

        fetchEnrollState();
    }, [mfaToken, navigate]);


    const handleVerifyMFA = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await API.post(
                "/auth/mfa/verify",
                { token: values.otp.trim() },
                {
                    headers: {
                        Authorization: `Bearer ${mfaToken}`,
                    }
                }
            );
            login(res.data.token)
            localStorage.removeItem("mfaToken");
            setToast({ success: true, message: "MFA verified successfully!" });
            setTimeout(() => navigate("/dashboard", { replace: true }), 1500);

        } catch (err) {
            setToast({
                success: false,
                message: err.response?.data?.message || "Invalid MFA code"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
            {toast && (
                <div className="fixed top-6 right-6 z-50">
                    <Toast
                        success={toast.success}
                        message={toast.message}
                        onClose={() => setToast(null)}
                    />
                </div>
            )}

            <div className="w-full max-w-md bg-neutral-800 border border-neutral-700 rounded-2xl shadow-2xl p-8">

                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mb-4">
                        🔐
                    </div>
                    <h2 className="text-2xl font-semibold text-white">
                        Multi-Factor Authentication
                    </h2>
                    <p className="text-sm text-neutral-400 mt-2">
                        Secure your account with an authenticator app
                    </p>
                </div>

                {/* QR Code */}
                {qrCode && (
                    <div className="mb-8 flex flex-col items-center">
                        <div className="bg-white p-3 rounded-xl shadow-lg">
                            <img
                                src={qrCode}
                                alt="MFA QR Code"
                                className="w-40 h-40"
                            />
                        </div>
                        <p className="text-xs text-neutral-400 mt-4 text-center max-w-xs">
                            Scan this QR code using Google Authenticator, Authy, or Microsoft Authenticator
                        </p>
                    </div>
                )}

                {/* OTP Form */}
                <form onSubmit={handleVerifyMFA} className="space-y-6">
                    <DefaultInput
                        placeholder="6-digit verification code"
                        type="text"
                        value={values.otp}
                        name="otp"
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />

                    <DefaultButton
                        type="submit"
                        label={loading ? "Verifying security code..." : "Confirm & Continue"}
                        disabled={loading}
                        className="w-full"
                    />
                </form>

                <div className="mt-8 text-center text-xs text-neutral-500">
                    This step protects your account from unauthorized access
                </div>
            </div>
        </div>
    );
};

export default EnrollMFA;
