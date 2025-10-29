import React, {useContext} from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import { authRoutes, publicRoutes } from "../routes";
import { LOGIN_ROUTE } from "../utils/consts";
import { observer } from 'mobx-react-lite';
import { Context } from "../index";

const AppRouter = observer(() => {
    const { user } = useContext(Context)
    console.log('Current user:', user);
    return (
        <Routes>
            {user.isAuth && authRoutes.map(({path, Component, role}) => 
                (role === undefined || user.user.role === role) && (
                    <Route key={path} path={path} element={<Component />} exact/>
                )
            )}
            {publicRoutes.map(({path, Component}) =>
                <Route key={path} path={path} element={<Component />} exact/>
            )}
            <Route 
                path="*" 
                element={
                    user.isAuth ? 
                    <Navigate to={user.isAdmin ? '/admin' : user.isTeacher ? '/teacher' : '/student'} /> : 
                    <Navigate to={LOGIN_ROUTE} />
                }
            />
        </Routes>
        // <Routes>
        //     {user.isAuth && authRoutes.map(({path, Component}) => 
        //         <Route key={path} path={path} element={<Component />} exact/>
        //     )}
        //     {publicRoutes.map(({path, Component}) =>
        //         <Route key={path} path={path} element={<Component />} exact/>
        //     )}
        //     <Route path="*" element={<Navigate to={LOGIN_ROUTE} replace />}/>
        // </Routes>
    )
})

export default AppRouter;