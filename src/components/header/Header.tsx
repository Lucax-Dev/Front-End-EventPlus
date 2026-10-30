import { Link, NavLink, useNavigate } from "react-router-dom";
import logoEvent from "../../assets/logo-event.svg";
import "./Header.css";
import { perfilEhAdministrador, perfilEhOrganizador, useAuth } from "../../context/auth";

// GUIDs vindos do banco de dados (SQL Server)
const ID_ADMINISTRADOR = "39f32459-db67-4c76-926c-0047a53137e3";
const ID_PALESTRANTE = "9f4375ff-1bce-4c42-ac8a-a0330017f236";

function Header() {
    const { autenticado, usuario, perfil, logout } = useAuth();
    const navigate = useNavigate();

    // Obtém o ID e título do perfil logado
    const sessionAny = (usuario || {}) as Record<string, any>;
    const idTipoUsuarioLogado = sessionAny.idTipoUsuario || usuario?.idTipoUsuario;
    const perfilNome = String(perfil || sessionAny.titulo || "").toLowerCase();

    // Validações flexíveis por GUID ou Nome
    const eAdmin =
        idTipoUsuarioLogado === ID_ADMINISTRADOR ||
        perfilNome === "administrador" ||
        perfilEhAdministrador(perfil);

    const eOrganizador =
        idTipoUsuarioLogado === ID_PALESTRANTE ||
        perfilNome === "palestrante" ||
        perfilNome === "organizador" ||
        perfilEhOrganizador(perfil) ||
        eAdmin; // Administrador também tem acesso ao cadastro

    function sair() {
        logout();
        navigate("/login");
    }

    return (
        <header className="header">
            <div className="header-conteudo">
                <Link to="/home">
                    <img src={logoEvent} alt="Logo Event+" />
                </Link>

                <nav>
                    <NavLink to="/home">Home</NavLink>
                    <NavLink to="/eventos">Eventos</NavLink>

                    {eAdmin ? (
                        <NavLink to="/usuarios">Usuários</NavLink>
                    ) : null}

                    {eOrganizador ? (
                        <NavLink to="/cadastro-evento">Cadastro de Eventos</NavLink>
                    ) : null}

                    <Link to="/home#contato">Contatos</Link>
                </nav>

                {autenticado ? (
                    <>
                        <Link to="/conta">Minha Conta</Link>
                        <Link onClick={sair} to="/login">Sair</Link>
                    </>
                ) : (
                    <Link to="/login">Entrar</Link>
                )}
            </div>
        </header>
    );
}

export default Header;