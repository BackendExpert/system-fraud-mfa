import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import defultImg from "../../assets/user.png";
import uoplogo from "../../assets/logo.png";
import dashboardbg from "../../assets/siteimg.jpg";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
    BiSolidDashboard,
    BiTimeFive,
    BiBarChartSquare,
} from "react-icons/bi";
import { FaUserGraduate, FaCog, FaQuestion } from "react-icons/fa";
import { MdEvent, MdLogout } from "react-icons/md";
import { FiBook } from "react-icons/fi";
import { motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import "./DashSide.css";

const DevDashSide = ({ closeSidebar }) => {
    const { auth, logout } = useAuth();
    const navigate = useNavigate();
    const [MyProfileImage, setMyProfileImage] = useState([]);
    const [collapsed, setCollapsed] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchMyProfileImage = async () => {
            try {
                const res = await API.get(
                    `/member/get-myprofileimage?nocache=${Date.now()}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Cache-Control": "no-cache",
                            Pragma: "no-cache",
                            Expires: "0",
                        },
                    }
                );
                setMyProfileImage(
                    Array.isArray(res.data.result)
                        ? res.data.result
                        : [res.data.result]
                );
            } catch (err) {
                console.error("Failed to fetch profile image:", err);
                setMyProfileImage([]);
            }
        };
        if (token) fetchMyProfileImage();
    }, [token]);

    const toggleSubmenu = (index) => {
        setOpenMenu(openMenu === index ? null : index);
    };

    const navitem = [
        { name: "Dashboard", icon: <BiSolidDashboard />, link: "/DevDashboard" },
        {
            name: "Interns",
            icon: <FaUserGraduate />,
            submenu: [{ name: "Manage Interns", link: "/DevDashboard/interns" }],
        },
        {
            name: "Attendance",
            icon: <BiTimeFive />,
            submenu: [
                { name: "Daily Attendance", link: "/DevDashboard/daily" },
                { name: "Attendance Summary", link: "/DevDashboard/summary" },
            ],
        },
        {
            name: "Reports",
            icon: <BiBarChartSquare />,
            submenu: [
                { name: "Attendance Reports", link: "/DevDashboard/attendance" },
                { name: "Performance Reports", link: "/DevDashboard/performance" },
                { name: "Monthly Overview", link: "/DevDashboard/monthly" },
            ],
        },
        {
            name: "Meetings",
            icon: <MdEvent />,
            submenu: [
                { name: "Manage Meetings", link: "/DevDashboard/meeting" },
                { name: "Create Meeting", link: "/DevDashboard/create-meeting" },
            ],
        },
        { name: "Resources", icon: <FiBook />, link: "/DevDashboard/resources" },
        { name: "FAQ & Help", icon: <FaQuestion />, link: "/DevDashboard/faq" },
        {
            name: "Settings",
            icon: <FaCog />,
            submenu: [
                { name: "Profile Settings", link: "/DevDashboard/profile" },
                { name: "System Configuration", link: "/DevDashboard/system" },
                { name: "User Activities", link: "/Dashboard/logs" },
            ],
        },
    ];

    const filteredNavItems =
        auth?.role === "staff"
            ? navitem.filter((item) => item.name !== "Settings")
            : navitem;

    return (
        <motion.aside
            initial={{ width: 300, opacity: 0 }}
            animate={{ width: collapsed ? 96 : 280, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="h-screen bg-gradient-to-b from-white to-purple-50 flex flex-col border-r border-purple-100"
        >
            {/* Fixed Header Section */}
            <div className="flex items-center pb-4 pt-5 px-4 sticky top-0 z-20 bg-gradient-to-b from-white to-purple-50 border-b border-purple-100">
                <motion.img
                    src={uoplogo}
                    alt="UOP Logo"
                    className="h-10 w-auto"
                    whileHover={{ scale: 1.1, rotate: 3 }}
                />
                {!collapsed && (
                    <motion.h1
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="ml-2 font-bold text-lg text-purple-600"
                    >
                        BAL
                    </motion.h1>
                )}
            </div>

            {/* Scrollable Sidebar Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <nav className="px-3 mt-4 space-y-1">
                    <h1 className="uppercase font-bold text-gray-500 text-xs mb-4">
                        main menu
                    </h1>

                    {filteredNavItems.map((item, index) => (
                        <div key={index}>
                            {item.submenu ? (
                                <>
                                    <button
                                        onClick={() => toggleSubmenu(index)}
                                        className={`group relative flex items-center justify-between w-full px-4 py-2 rounded-xl font-medium transition-all duration-300 ${openMenu === index
                                            ? "text-purple-600 bg-purple-50 shadow-sm"
                                            : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <motion.span
                                                whileHover={{ scale: 1.15, rotate: 4 }}
                                                className="text-xs"
                                            >
                                                {item.icon}
                                            </motion.span>
                                            {!collapsed && (
                                                <motion.span
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="text-sm tracking-wide"
                                                >
                                                    {item.name}
                                                </motion.span>
                                            )}
                                        </div>
                                        {!collapsed && (
                                            openMenu === index ? (
                                                <ChevronDown className="w-4 h-4 text-purple-500" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                            )
                                        )}
                                    </button>

                                    {!collapsed && openMenu === index && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            transition={{ duration: 0.3 }}
                                            className="ml-8 mt-1 space-y-1"
                                        >
                                            {item.submenu.map((sub, subIndex) => (
                                                <NavLink
                                                    key={subIndex}
                                                    to={sub.link}
                                                    onClick={closeSidebar}
                                                    className={({ isActive }) =>
                                                        `block px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${isActive
                                                            ? "text-purple-600 font-semibold"
                                                            : "text-gray-500 hover:text-purple-600"
                                                        }`
                                                    }
                                                >
                                                    {sub.name}
                                                </NavLink>
                                            ))}
                                        </motion.div>
                                    )}
                                </>
                            ) : (
                                <NavLink
                                    to={item.link}
                                    onClick={closeSidebar}
                                    className={({ isActive }) =>
                                        `group relative flex items-center gap-3 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${isActive
                                            ? "text-purple-600"
                                            : "text-gray-600 hover:text-purple-600 hover:ml-1"
                                        }`
                                    }
                                >
                                    <motion.span
                                        whileHover={{ scale: 1.2, rotate: 5 }}
                                        className="text-xs"
                                    >
                                        {item.icon}
                                    </motion.span>
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-sm tracking-wide"
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}
                                </NavLink>
                            )}
                        </div>
                    ))}

                    {/* Logout */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => logout(navigate)}
                        className="flex items-center gap-3 w-full px-4 py-3 mt-6 text-red-400 hover:text-white hover:bg-red-500/30 rounded-xl font-medium transition-all duration-300"
                    >
                        <MdLogout className="text-xl" />
                        {!collapsed && <span className="text-sm">Logout</span>}
                    </motion.button>
                </nav>

                {/* User Info & Background */}
                {!collapsed && (
                    <div className="px-4 py-4 mt-6 border-t border-purple-100 bg-gradient-to-r from-purple-50 to-white relative">
                        <div className="flex items-center gap-3 mb-3">
                            <img
                                src={MyProfileImage[0]?.url || defultImg}
                                alt="User"
                                className="w-10 h-10 rounded-full object-cover shadow-md"
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-700">
                                    {auth?.user?.username || "User"}
                                </span>
                                <span className="text-xs text-gray-500 capitalize">
                                    {auth?.role || "intern"}
                                </span>
                            </div>
                        </div>

                        <div className="relative rounded-xl overflow-hidden">
                            <img
                                src={dashboardbg}
                                alt="Dashboard Decoration"
                                className="w-full h-20 object-cover rounded-lg opacity-70 hover:opacity-90 transition"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent"></div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 text-center text-[10px] text-purple-400 border-t border-purple-100"
                >
                    {!collapsed && (
                        <>
                            © {new Date().getFullYear()} Employee Management System
                            <br />
                            <span className="text-fuchsia-500 font-semibold">
                                BlackAlphaLabs
                            </span>
                        </>
                    )}
                </motion.div>
            </div>
        </motion.aside>
    );
};

export default DevDashSide;
