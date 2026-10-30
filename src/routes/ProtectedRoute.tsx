import type { PropsWithChildren } from "react";
import { useAuth } from "../context/auth";
import { Navigate, useLocation } from "react-router-dom";

const ID_ADMINISTRADOR = "39f32459-db67-4c76-926c-0047a53137e3";
const ID_PALESTRANTE = "9f4375ff-1bce-4c42-ac8a-a0330017f236";

interface ProtectedRouteProps extends PropsWithChildren {
    role?: "administrador" | "palestrante" | "organizador";
}

function ProtectedRoute({ children, role }: ProtectedRouteProps) {
    const { autenticado, carregandoSessao, usuario, perfil } = useAuth();
    const location = useLocation();

    if (carregandoSessao) {
        return <main>Carregando sessão...</main>;
    }

    if (!autenticado) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // Procura o ID em todos os locais onde ele possa estar guardado na sessão
    const userAny = (usuario || {}) as Record<string, any>;
    const idTipoUsuario =
        userAny.idTipoUsuario ||
        userAny.usuario?.idTipoUsuario ||
        usuario?.idTipoUsuario;

    const perfilNome = String(
        perfil || userAny.titulo || userAny.usuario?.titulo || ""
    ).toLowerCase();

    // Confirma se é Administrador (por GUID ou por Nome)
    const ehAdmin =
        idTipoUsuario === ID_ADMINISTRADOR || perfilNome === "administrador";

    // Confirma se é Organizador/Palestrante (Admin também tem permissão)
    const ehOrganizador =
        idTipoUsuario === ID_PALESTRANTE ||
        perfilNome === "palestrante" ||
        perfilNome === "organizador" ||
        ehAdmin;

    let autorizado = true;

    if (role === "administrador") {
        autorizado = ehAdmin;
    } else if (role === "palestrante" || role === "organizador") {
        autorizado = ehOrganizador;
    }

    if (!autorizado) {
        return <Navigate to="/home" replace />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;