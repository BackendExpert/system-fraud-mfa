import React, { useEffect, useState, useMemo } from 'react'
import API from '../../../../services/api'

const ITEMS_PER_PAGE = 15

const Userlogs = () => {
    const [userLogs, setUserLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    const token = localStorage.getItem('token')

    useEffect(() => {
        const fetchUserLogs = async () => {
            try {
                const res = await API.get(
                    `/activity/get-activities?nocache=${Date.now()}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                const logs = Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data?.data)
                        ? res.data.data
                        : []

                setUserLogs(logs)
            } catch (error) {
                console.error('Failed to fetch user logs:', error)
            } finally {
                setLoading(false)
            }
        }

        if (token) fetchUserLogs()
    }, [token])

    // 🔍 SEARCH FILTER
    const filteredLogs = useMemo(() => {
        if (!search) return userLogs

        const q = search.toLowerCase()

        return userLogs.filter(log =>
            log.action?.toLowerCase().includes(q) ||
            log.description?.toLowerCase().includes(q) ||
            log.ipAddress?.toLowerCase().includes(q) ||
            log.userAgent?.toLowerCase().includes(q)
        )
    }, [search, userLogs])

    // 📄 PAGINATION
    const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE)

    const paginatedLogs = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredLogs.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredLogs, currentPage])

    useEffect(() => {
        setCurrentPage(1)
    }, [search])

    if (loading) {
        return <div className="p-6 text-gray-500">Loading user logs...</div>
    }

    return (
        <div className="p-4 min-h-screen">
            {/* HEADER */}
            <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-800">
                    User Activity Logs
                </h2>

                <input
                    type="text"
                    placeholder="Search logs…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mt-3 w-full px-4 py-3 rounded-lg
                           bg-white border border-slate-300
                           focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {/* LOGS */}
            {paginatedLogs.length === 0 ? (
                <div className="text-center text-sm text-slate-500 py-10">
                    No activity logs found
                </div>
            ) : (
                <div className="space-y-3">
                    {paginatedLogs.map(log => (
                        <div
                            key={log._id}
                            className="bg-white rounded-xl border
                                   border-slate-200 shadow-sm"
                        >
                            <div className="p-4 space-y-2">
                                {/* ACTION */}
                                <div className="text-xs font-semibold text-indigo-600">
                                    {log.action}
                                </div>

                                {/* DESCRIPTION */}
                                <div className="text-sm text-slate-800">
                                    {log.description || '—'}
                                </div>

                                {/* META */}
                                <div className="text-xs text-slate-500 space-y-1">
                                    <div>IP: {log.ipAddress || '—'}</div>
                                    <div className="truncate">
                                        Device: {log.userAgent || '—'}
                                    </div>
                                    <div>
                                        {new Date(log.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="mt-6 flex gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex-1 py-3 rounded-lg
                               bg-white border border-slate-300
                               text-sm disabled:opacity-40"
                    >
                        Prev
                    </button>

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="flex-1 py-3 rounded-lg
                               bg-white border border-slate-300
                               text-sm disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )


}

export default Userlogs
