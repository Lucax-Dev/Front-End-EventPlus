import { Navigate, Route, Routes } from "react-router-dom";

import Home from "../pages/Home/Home"
import Eventos from "../pages/Eventos/Eventos"
import DetalhesEvento from "../pages/DetalhesEvento/DetalhesEvento";
import Login from "../pages/Login/Login";

function AppRoutes() {
    return(
        <Routes>
            <Route path="/home" element={<Home/>} />

            <Route path="/eventos" element={<Eventos/>} />

            <Route path="/eventos/:id" element={<DetalhesEvento/>} />

            <Route path="/login" element={<Login/>}/>

            <Route path="*" element={<Navigate to="/home" replace/>} />
        </Routes>
    )
}

export default AppRoutes;