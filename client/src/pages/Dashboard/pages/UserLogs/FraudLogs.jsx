import React, { useEffect, useMemo, useState } from 'react';
import API from '../../../../services/api';

const ITEMS_PER_PAGE = 20;

const FraudLogs = () => {
    const [fraudLogs, setFraudLogs] = useState([]);
    const [search, setSearch] = useState('');
    const [riskFilter, setRiskFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) return;

        const fetchFraudLogs = async () => {
            try {
                const res = await API.get(
                    `/activity/get-fraudlogs?nocache=${Date.now()}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setFraudLogs(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error(err);
            }
        };

        fetchFraudLogs();
    }, [token]);


    const filteredLogs = useMemo(() => {
        return fraudLogs.filter(log => {
            const matchesRisk =
                riskFilter === 'ALL' || log.riskLevel === riskFilter;

            const searchText = search.toLowerCase();

            const matchesSearch =
                log.userAgent?.toLowerCase().includes(searchText) ||
                log.ip?.toLowerCase().includes(searchText) ||
                log.deviceId?.toLowerCase().includes(searchText);

            return matchesRisk && matchesSearch;
        });
    }, [fraudLogs, search, riskFilter]);


    const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);

    const paginatedLogs = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredLogs.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredLogs, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, riskFilter]);

    return (
        <div className="p-4 space-y-4">


            <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">

                <div className="relative w-full md:w-1/2">
                    <input
                        type="text"
                        placeholder="Search by IP, Device ID, User Agent…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="
                            w-full h-11
                            rounded-xl
                            bg-white/80 backdrop-blur
                            border border-slate-200
                            px-4 pl-10
                            text-sm text-slate-800
                            placeholder-slate-400
                            shadow-sm
                            transition-all duration-200
                            focus:border-blue-500
                            focus:ring-4 focus:ring-blue-500/10
                            focus:outline-none
                        "
                    />

                    {/* search icon */}
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </div>



                <div className="relative w-full md:w-48">
                    <select
                        value={riskFilter}
                        onChange={(e) => setRiskFilter(e.target.value)}
                        className="
                            w-full h-11
                            appearance-none
                            rounded-xl
                            bg-white/80 backdrop-blur
                            border border-slate-200
                            px-4 pr-10
                            text-sm text-slate-800
                            shadow-sm
                            transition-all duration-200
                            cursor-pointer
                            focus:border-blue-500
                            focus:ring-4 focus:ring-blue-500/10
                            focus:outline-none
                        "
                    >
                        <option value="ALL">All Risks</option>
                        <option value="LOW">Low Risk</option>
                        <option value="MEDIUM">Medium Risk</option>
                        <option value="HIGH">High Risk</option>
                    </select>

                    {/* dropdown arrow */}
                    <svg
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginatedLogs.map((log) => (
                    <div
                        key={log._id}
                        className={`
                            bg-white rounded-xl p-4 shadow-sm border-l-4
                            ${log.riskLevel === "HIGH"
                                ? "border-red-500"
                                : log.riskLevel === "MEDIUM"
                                    ? "border-amber-400"
                                    : "border-green-500"
                            }
                            hover:shadow-lg transition-all
                        `}
                    >
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                            User Agent
                        </p>

                        <p className="text-sm text-slate-800 mb-3 break-all">
                            {log.userAgent}
                        </p>

                        <div className="flex justify-between text-sm text-slate-700 mb-2">
                            <span>
                                <span className="font-semibold">IP:</span> {log.ip}
                            </span>
                            <span>
                                <span className="font-semibold">Device:</span> {log.deviceId}
                            </span>
                        </div>

                        <hr className="my-3 border-slate-200" />

                        {Array.isArray(log.reasons) && log.reasons.length > 0 && (
                            <div className="mb-3 space-y-2">
                                <p className="text-xs font-semibold text-slate-500 uppercase">
                                    Risk Reasons
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {log.reasons.map((reason) => (
                                        <div
                                            key={reason._id}
                                            className="
                                                flex items-start gap-2
                                                px-3 py-2
                                                rounded-lg
                                                bg-slate-50
                                                border border-slate-200
                                                text-xs text-slate-700
                                            "
                                        >
                                            <span className="
                                                font-mono font-semibold
                                                text-slate-600
                                                bg-slate-100
                                                px-2 py-0.5
                                                rounded
                                                whitespace-nowrap
                                            ">
                                                {reason.code}
                                            </span>

                                            <span className="leading-snug">
                                                {reason.message}
                                                <span className="ml-1 text-slate-400">
                                                    (+{reason.weight})
                                                </span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <span
                                className={`
                                    text-xs font-bold px-3 py-1 rounded-full
                                    ${log.riskLevel === "HIGH"
                                        ? "bg-red-100 text-red-700"
                                        : log.riskLevel === "MEDIUM"
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-green-100 text-green-700"
                                    }
                                `}
                            >
                                {log.riskLevel} RISK
                            </span>

                            <span className="text-xs text-slate-500 font-medium">
                                Score: {log.riskScore}
                            </span>
                        </div>
                    </div>
                ))}
            </div>


            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="px-3 py-1 text-sm rounded border disabled:opacity-40"
                    >
                        Prev
                    </button>

                    <span className="text-sm text-slate-600">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="px-3 py-1 text-sm rounded border disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}

        </div>
    );
};

export default FraudLogs;
