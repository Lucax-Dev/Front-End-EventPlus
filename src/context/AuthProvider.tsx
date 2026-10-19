import { useEffect, useRef, useState, type PropsWithChildren } from "react";
import { axiosInstance, SESSION_STORAGE_KEY, UNATHORIZED_EVENT } from "../services/api";
import type { AuthSession, LoginPayload } from "../types/api";
import { authService, usuarioService } from "../services/eventPlusservice";
import { AuthContext } from "./auth";

function readSession(): AuthSession | null {
    try {
        const value = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!value) return null;
        const session = JSON.parse(value) as AuthSession;
        if (!session.token || new Date(session.expiracao).getTime() <= Date.now()) {
            localStorage.removeItem(SESSION_STORAGE_KEY);
            return null;
        }

        // Configura o token no Axios assim que o app carrega
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${session.token}`;

        return session;
    } catch {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
    }
}

export function AuthProvider({ children }: PropsWithChildren) {
    const [session, setSession] = useState<AuthSession | null>(() => readSession());
    const initialSession = useRef(session);
    const [carregadoSessao, setCarregadoSessao] = useState<boolean>(false);

    function persist(next: AuthSession | null) {
        setSession(next);
        if (next?.token) {
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
            // Injeta o token do usuário logado no Axios
            axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${next.token}`;
        } else {
            localStorage.removeItem(SESSION_STORAGE_KEY);
            // Remove o token do Axios ao deslogar
            delete axiosInstance.defaults.headers.common["Authorization"];
        }
    }

    async function atualizarUsuario() {
        if (!session?.usuario?.idUsuario) return;
        try {
            const usuario = await usuarioService.buscar(session.usuario.idUsuario);
            persist({ ...session, usuario });
        } catch (error) {
            console.error("Erro ao atualizar usuário:", error);
        }
    }

    async function login(payload: LoginPayload) {
        const loginResponse = await authService.login(payload);
        const baseSession: AuthSession = loginResponse;
        persist(baseSession);
        try {
            const usuario = await usuarioService.buscar(loginResponse.usuario.idUsuario);
            persist({ ...baseSession, usuario });
        } catch {
            // Mantém baseSession caso a busca estendida falhe
        }
    }

    function logout() {
        persist(null);
    }

    useEffect(() => {
        const handleUnauthorized = () => persist(null);
        window.addEventListener(UNATHORIZED_EVENT, handleUnauthorized);
        return () => window.removeEventListener(UNATHORIZED_EVENT, handleUnauthorized);
    }, []);

    useEffect(() => {
        const restored = initialSession.current;

        if (!restored?.usuario?.idUsuario) {
            setCarregadoSessao(true);
            return;
        }

        if (restored.token) {
            axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${restored.token}`;
        }

        usuarioService
            .buscar(restored.usuario.idUsuario)
            .then((usuario) => {
                const next = { ...restored, usuario };
                localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
                setSession(next);
            })
            .catch(() => undefined)
            .finally(() => setCarregadoSessao(true));
    }, []);

    const perfil = session?.usuario?.idTipoUsuarioNavigation?.titulo?.toLowerCase() ?? "";

    return (
        <AuthContext.Provider
            value={{
                session,
                usuario: session?.usuario ?? null,
                perfil,
                autenticado: Boolean(session?.token),
                carregadoSessao,
                login,
                logout,
                atualizarUsuario
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}