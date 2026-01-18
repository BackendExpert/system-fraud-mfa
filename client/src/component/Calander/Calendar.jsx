import React, { useState } from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(dayjs());

    const daysInMonth = currentDate.daysInMonth();
    const startDay = currentDate.startOf("month").day();
    const today = dayjs();

    const prevMonth = () => setCurrentDate(currentDate.subtract(1, "month"));
    const nextMonth = () => setCurrentDate(currentDate.add(1, "month"));

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className="mx-auto ">
            <div className="bg-gradient-to-br from-purple-700 via-purple-900 to-indigo-900 rounded-2xl shadow-2xl p-6 text-white">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={prevMonth}
                        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition"
                    >
                        ◀
                    </button>
                    <h2 className="text-2xl font-bold tracking-wide">
                        {currentDate.format("MMMM YYYY")}
                    </h2>
                    <button
                        onClick={nextMonth}
                        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition"
                    >
                        ▶
                    </button>
                </div>

                {/* Weekdays */}
                <div className="grid grid-cols-7 text-center font-semibold text-purple-200 mb-2">
                    {weekdays.map((day) => (
                        <div key={day} className="py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-2 text-center">
                    {Array.from({ length: startDay }).map((_, i) => (
                        <div key={i}></div>
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const date = currentDate.date(i + 1);
                        const isToday =
                            date.format("DD-MM-YYYY") === today.format("DD-MM-YYYY");

                        return (
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                key={i}
                                className={`p-3 rounded-xl cursor-pointer transition 
                  ${isToday
                                        ? "bg-purple-500 text-white shadow-lg ring-2 ring-purple-300"
                                        : "bg-purple-800/40 text-purple-200 hover:bg-purple-700/70"
                                    }`}
                            >
                                {i + 1}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Calendar;
