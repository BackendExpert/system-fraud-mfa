import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, User, Settings, LogOut, Menu, X } from "lucide-react";
import defultUser from "../../assets/user.png";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";

const SecNav = () => {
    const { auth, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [MyProfileImage, setMyProfileImage] = useState([]);
    const token = localStorage.getItem("token");

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch profile image
    useEffect(() => {
        const fetchImage = async () => {
            try {
                const res = await API.get(`/member/get-myprofileimage?nocache=${Date.now()}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMyProfileImage(
                    Array.isArray(res.data.result) ? res.data.result : [res.data.result]
                );
            } catch {
                setMyProfileImage([]);
            }
        };
        fetchImage();
    }, [token]);

    return (
        <motion.header
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-[#560606] text-white shadow-md border-b border-[#4a0404]"
        >
            <div className="flex items-center justify-between px-4 md:px-10 py-3 relative">
                {/* Left Section */}
                <div className="flex items-center gap-3">
                    <Link to="/my-account">
                        <h1 className="text-sm md:text-base font-semibold tracking-wide hover:text-fuchsia-200 transition">
                            UOP - PWAC | Dashboard v1
                        </h1>
                    </Link>
                </div>

                {/* Mobile Hamburger */}
                <div className="md:hidden flex items-center gap-4">
                    <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
                        {menuOpen ? (
                            <X className="w-6 h-6 text-white" />
                        ) : (
                            <Menu className="w-6 h-6 text-white" />
                        )}
                    </button>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6">
                    <Link
                        to="/my-account/create-appointment"
                        className="text-sm font-medium text-fuchsia-100 hover:text-white hover:underline transition-all"
                    >
                        Create Appointment
                    </Link>
                    <Link
                        to="/my-account/track-appointment"
                        className="text-sm font-medium text-fuchsia-100 hover:text-white hover:underline transition-all"
                    >
                        Track My Appointment
                    </Link>

                    {/* User Menu */}
                    <div className="relative" ref={dropdownRef}>
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setOpen(!open)}
                            className="flex items-center gap-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 transition-all border border-fuchsia-200/30 shadow-sm"
                        >
                            <div className="relative">
                                <img
                                    src={
                                        MyProfileImage[0]?.profileimg
                                            ? `${import.meta.env.VITE_APP_API_FILES}/uploads/${MyProfileImage[0].profileimg}`
                                            : defultUser
                                    }
                                    alt="User"
                                    className="h-10 w-10 rounded-full border-2 border-fuchsia-200/50 object-cover shadow-md"
                                />
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border border-[#560606] rounded-full" />
                            </div>

                            <div className="hidden sm:block text-left leading-tight">
                                <p className="font-semibold text-sm text-white">
                                    {auth?.user?.username || "User"}
                                </p>
                                <p className="text-[10px] text-fuchsia-100 uppercase">
                                    {auth?.role}
                                </p>
                            </div>

                            <ChevronDown
                                className={`w-4 h-4 text-fuchsia-100 transition-transform duration-300 ${open ? "rotate-180" : ""
                                    }`}
                            />
                        </motion.button>

                        {/* Dropdown */}
                        <AnimatePresence>
                            {open && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-3 w-56 bg-white border border-[#560606]/30 rounded-xl shadow-2xl overflow-hidden z-50"
                                >
                                    <ul className="py-2 text-sm text-gray-700">
                                        <li>
                                            <Link to={"/my-account/my-profile"}>
                                                <button className="flex items-center w-full px-4 py-2 hover:bg-[#560606]/10 transition">
                                                    <User className="w-4 h-4 mr-2 text-[#560606]" /> Profile
                                                </button>
                                            </Link>
                                        </li>
                                        <li>
                                            <button className="flex items-center w-full px-4 py-2 hover:bg-[#560606]/10 transition">
                                                <Settings className="w-4 h-4 mr-2 text-[#560606]" /> Settings
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                onClick={logout}
                                                className="flex items-center w-full px-4 py-2 hover:bg-red-100 transition text-red-600"
                                            >
                                                <LogOut className="w-4 h-4 mr-2" /> Logout
                                            </button>
                                        </li>
                                    </ul>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden bg-[#4a0404] text-fuchsia-100 border-t border-[#ffffff2f] px-6 py-4 space-y-4"
                    >
                        <Link
                            to="/my-account/create-appointment"
                            className="block text-sm font-medium hover:text-white transition"
                            onClick={() => setMenuOpen(false)}
                        >
                            Create Appointment
                        </Link>
                        <Link
                            to="/my-account/track-appointment"
                            className="block text-sm font-medium hover:text-white transition"
                            onClick={() => setMenuOpen(false)}
                        >
                            Track My Appointment
                        </Link>
                        <hr className="border-fuchsia-200/30" />
                        <div className="flex items-center gap-3">
                            <img
                                src={
                                    MyProfileImage[0]?.profileimg
                                        ? `${import.meta.env.VITE_APP_API_FILES}/uploads/${MyProfileImage[0].profileimg}`
                                        : defultUser
                                }
                                alt="User"
                                className="h-10 w-10 rounded-full border-2 border-fuchsia-200/50 object-cover shadow-md"
                            />
                            <div>
                                <p className="font-semibold text-white">{auth?.user?.username || "User"}</p>
                                <p className="text-xs text-fuchsia-100 uppercase">{auth?.role}</p>
                            </div>
                        </div>
                        <div className="pt-3 space-y-2">
                            <Link
                                to={"/my-account/my-profile"}
                                className="flex items-center gap-2 hover:text-white"
                                onClick={() => setMenuOpen(false)}
                            >
                                <User className="w-4 h-4" /> Profile
                            </Link>
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 text-red-400 hover:text-red-500"
                            >
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

export default SecNav;
