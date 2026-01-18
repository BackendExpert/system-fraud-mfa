import { BrowserRouter, Route, Routes } from 'react-router-dom'
import WebSite from '../layouts/WebSite'
import DefultError from '../component/Errors/DefultError'
import CreateAuth from '../pages/AuthPages/CreateAuth'
import VerifyPassword from '../pages/AuthPages/VerifyPassword'
import EnrollMFA from '../pages/AuthPages/EnrollMFA'
import PrivateRoute from './PrivateRoute'
import Dashboard from '../layouts/Dashboard'
import DashHome from '../pages/Dashboard/DashHome'


function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<WebSite />} >
                    <Route path='*' element={<DefultError />} />

                    <Route index element={<CreateAuth /> } />
                    <Route path='/verify-password' element={<VerifyPassword /> } />
                    <Route path='/enroll-mfa' element={<EnrollMFA /> } />
                </Route>

                <Route path='/dashboard' element={<PrivateRoute roles={['admin', 'developer', 'user']} ><Dashboard /></PrivateRoute>}>
                    <Route index element={<PrivateRoute roles={['admin', 'developer', 'user']} ><DashHome /></PrivateRoute>} />
                </Route>                

            </Routes>
        </BrowserRouter>
    )
}

export default App
