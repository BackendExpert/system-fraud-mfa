import React from 'react'
import { useAuth } from '../../context/AuthContext'
import AdminDash from './AdminDash'

const DashHome = () => {
    const { auth } = useAuth()

    if (auth?.role === "admin") {
        return (
            <AdminDash />
        )
    }
    if (auth?.role === "user") {
        return (
            <div className="">I am Users</div>
        )
    }
}

export default DashHome