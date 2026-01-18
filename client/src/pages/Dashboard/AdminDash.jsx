import React from 'react'
import { FaUserClock, FaUserShield } from "react-icons/fa";

const AdminDash = () => {
    const dashdata = [
        {
            id: 1,
            name: "User Actions",
            icon: FaUserClock,
            countvalue: 102,
        },
        {
            id: 2,
            name: "Fraud Actions",
            icon: FaUserShield,
            countvalue: 85,
        }
    ];

    return (
        <div>
            <div className="grid grid-cols-3 gap-4">
                {dashdata.map((data) => {
                    const Icon = data.icon;

                    return (
                        <div
                            key={data.id}
                            className="bg-emerald-700 rounded-lg p-4"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <Icon className="h-10 w-10 text-white mb-2" />
                                    <div className="text-white font-semibold">
                                        {data.name}
                                    </div>
                                </div>

                                <div className="text-2xl font-bold text-white">
                                    {data.countvalue}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminDash;
