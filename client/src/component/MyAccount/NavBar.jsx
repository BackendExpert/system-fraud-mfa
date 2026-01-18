import React from "react";
import Logo from "../../assets/logo.png";

const NavBar = () => {
    return (
        <div className="bg-[#560606] text-white px-6 md:px-10 py-6 shadow-md">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
                <div className="flex items-center gap-3">
                    <img
                        src={Logo}
                        alt="Logo"
                        className="h-14 w-auto drop-shadow-md"
                    />
                    <div>
                        <p className="text-lg md:text-xl font-semibold tracking-wide">
                            Psychological Wellbeing & Assessment Center
                        </p>
                        <p className="text-sm text-fuchsia-100/90">
                            University of Peradeniya
                        </p>
                    </div>
                </div>

                <div className="text-xs md:text-sm text-fuchsia-100/70 italic hidden md:block">
                    "Empowering minds, nurturing wellbeing"
                </div>
            </div>
        </div>
    );
};

export default NavBar;
