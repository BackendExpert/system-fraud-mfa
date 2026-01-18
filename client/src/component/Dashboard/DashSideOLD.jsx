import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
    MdDashboard,
    MdSettings,
    MdLogout,
    MdHistory,
    MdAssessment,
    MdAssignment,
    MdWork,
    MdGroup,
    MdOutlineMail,
    MdCheckCircle,
    MdPerson,
} from 'react-icons/md';
import { FaBalanceScale } from "react-icons/fa";
import {
    FaUserShield,
    FaChevronDown,
    FaChevronUp,
    FaUsers,
    FaDiagramProject,   // ✅ instead of FaProjectDiagram
    FaClipboardList,
    FaUserGraduate,
    FaRegFile          // ✅ instead of FaFileAlt
} from "react-icons/fa6";
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

const DashSide = () => {
    const { auth, logout } = useAuth();
    const [openMenu, setOpenMenu] = useState(null);
    const [pimg, setPimg] = useState(null);
    const [imgSrc, setImgSrc] = useState("/default-avatar.png"); // fallback
    const token = localStorage.getItem('token');

    const toggleMenu = (index) => {
        setOpenMenu(openMenu === index ? null : index);
    };

    // Fetch profile image path from backend
    useEffect(() => {
        const fetchProfileImage = async () => {
            try {
                const res = await API.get(`/auth/get-profile-img?nocache=${Date.now()}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Cache-Control": "no-cache",
                        Pragma: "no-cache",
                        Expires: "0",
                    },
                });
                setPimg(res.data.result || null);
            } catch (err) {
                console.error("Failed to fetch profile image:", err);
                setPimg(null);
            }
        };
        fetchProfileImage();
    }, [token]);

    // Fetch actual image blob safely
    useEffect(() => {
        if (pimg?.profile_image) {
            const normalizedPath = pimg.profile_image.replace(/\\/g, "/");
            const url = `${import.meta.env.VITE_APP_API}${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;

            fetch(url)
                .then(res => res.blob())
                .then(blob => setImgSrc(URL.createObjectURL(blob)))
                .catch(err => {
                    console.error("Failed to load image blob:", err);
                    setImgSrc("/default-avatar.png");
                });
        } else {
            setImgSrc("/default-avatar.png");
        }
    }, [pimg]);

    // Menu items configuration with updated unique icons
    const menuItems = [
        { link: '/Dashboard', name: 'Overview', icon: <MdDashboard /> },

        auth.role === 'admin' && {
            link: '/Dashboard/manage-roles',
            name: 'System Roles',
            icon: <FaUserShield />,
            submenu: [
                { name: 'Roles', link: '/Dashboard/manage-roles', icon: <MdSettings /> },
                { name: 'Permission', link: '/Dashboard/permissions', icon: <FaBalanceScale /> },
                { name: 'System Users', link: '/Dashboard/system-users', icon: <MdGroup /> }
            ]
        },
        (auth.role === 'admin' || auth.role === 'supervisor') && {
            link: '/Dashboard/projects',
            name: 'Projects',
            icon: <FaDiagramProject />,
        },
        (auth.role === 'admin' || auth.role === 'supervisor') && {
            link: '/Dashboard/letters',
            name: 'Letters',
            icon: <MdOutlineMail />,
        },
        (auth.role === 'supervisor') && {
            link: '/Dashboard/my-interns',
            name: 'My Interns',
            icon: <FaUserGraduate />,
        },
        (auth.role === 'intern') && {
            link: '/Dashboard/my-letters',
            name: 'My letters',
            icon: <FaRegFile />,
        },
        (auth.role === 'intern') && {
            link: '/Dashboard/my-projects',
            name: 'My Projects',
            icon: <FaDiagramProject />,
        },
        (auth.role === 'admin' || auth.role === 'staff' || auth.role === 'supervisor') && {
            link: '/Dashboard/intern-attendance',
            name: 'Intern Attendance',
            icon: <MdGroup />,
        },
        (auth.role === 'intern') && {
            link: '/Dashboard/my-attendance',
            name: 'My Attendance',
            icon: <MdCheckCircle />,
        },

        (auth.role === 'admin' || auth.role === 'staff') && {
            link: '/Dashboard/activities',
            name: 'User Activities',
            icon: <MdHistory />,
        },
    ].filter(Boolean); // remove false items for non-admin users

    return (
        <aside className="h-screen w-64 bg-white border-r border-blue-200 shadow-lg flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-blue-200 shrink-0">
                <MdDashboard className="h-7 w-7 text-blue-600" />
                <h1 className="text-2xl font-bold text-blue-700 tracking-tight">Dashboard</h1>
            </div>

            {/* Profile Section */}
            <div className="flex items-center gap-4 px-6 py-6 border-b border-blue-100 shrink-0">
                <img
                    src={imgSrc}
                    alt="Profile"
                    className="w-14 h-14 rounded-full border-2 border-blue-400 shadow-md"
                />
                <div>
                    <h2 className="text-md font-semibold text-gray-800">{auth.user?.username}</h2>
                    <p className="text-sm text-gray-500">{auth.role}</p>
                </div>
            </div>

            {/* Menu Items */}
            <nav className="px-4 mt-4 space-y-1 shrink-0">
                {menuItems.map((item, index) => (
                    <div key={index}>
                        {!item.submenu ? (
                            <NavLink
                                to={item.link}
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all 
                                    ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-blue-100 hover:text-blue-700'}`
                                }
                            >
                                <span className="text-xl transition-all group-hover:text-blue-700 text-blue-500">{item.icon}</span>
                                <span className="text-sm font-medium tracking-wide">{item.name}</span>
                            </NavLink>
                        ) : (
                            <>
                                <button
                                    onClick={() => setOpenMenu(openMenu === index ? null : index)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all
                                        ${openMenu === index ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-blue-100 hover:text-blue-700'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl text-blue-500">{item.icon}</span>
                                        <span className="text-sm font-medium tracking-wide">{item.name}</span>
                                    </div>
                                    {openMenu === index ? <FaChevronUp /> : <FaChevronDown />}
                                </button>
                                {openMenu === index && (
                                    <div className="ml-8 mt-1 space-y-1">
                                        {item.submenu.map((sub, subIndex) => (
                                            <NavLink
                                                key={subIndex}
                                                to={sub.link}
                                                className={({ isActive }) =>
                                                    `group flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all
                                                    ${isActive ? 'bg-blue-200 text-blue-900' : 'text-gray-600 hover:bg-blue-100 hover:text-blue-700'}`
                                                }
                                            >
                                                <span className="text-lg text-blue-500">{sub.icon}</span>
                                                <span className="text-sm">{sub.name}</span>
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}

                {/* Logout Button */}
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 mt-2 rounded-lg cursor-pointer transition-all text-red-600 hover:bg-red-100 hover:text-red-700"
                >
                    <span className="text-xl text-red-500"><MdLogout /></span>
                    <span className="text-sm font-medium tracking-wide">Logout</span>
                </button>
            </nav>

            {/* Footer Spacer */}
            <div className="mt-auto p-4 text-center text-xs text-gray-400 shrink-0">
                © {new Date().getFullYear()} M&E System
            </div>
        </aside>
    );
};

export default DashSide;
