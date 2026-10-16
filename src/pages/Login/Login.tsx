import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import logoEvent from "../../assets/logo-event.svg";

import "./Login.css";
import { useAuth } from "../../context/auth";
import Botao from "../../components/botao/Botao";

function Login() {
    const navigate = useNavigate();
    const { login, autenticado } = useAuth();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if (autenticado) navigate("/home", { replace: true });
    }, [autenticado, navigate]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setErro("");
        setEnviando(true);

        try {
            await login({ email, senha });
        } catch {
            setErro("E-mail ou senha incorretos.");
        } finally {
            setEnviando(false);
        }
    }

    return (
        <main className="login-container">
            <img src={logoEvent} alt="EventPlus logo" />

            <form onSubmit={handleSubmit} className="login-form">
                {erro && <p className="login-erro">{erro}</p>}

                <div>
                    <label htmlFor="email">E-mail</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Digite seu e-mail..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="senha">Senha</label>
                    <input
                        type="password"
                        name="senha"
                        id="senha"
                        placeholder="Digite sua senha..."
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                    />
                </div>

                <Botao
                    texto={enviando ? "Entrando..." : "Entrar"}
                    type="submit"
                    disabled={enviando}
                />
            </form>
        </main>
    );
}

export default Login;