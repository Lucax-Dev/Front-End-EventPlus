import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

import type { Comentario, Evento, Presenca } from "../../types/api";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Botao from "../../components/botao/Botao";

import imagemPadrao from "../../assets/banner-1.png";

import relogio from "../../assets/icons/relogio.svg";
import predio from "../../assets/icons/predio.svg";
import filtro from "../../assets/icons/filtro.svg";

import "./DetalhesEvento.css";
import { eventoService, presencaService, comentarioService } from "../../services/eventPlusservice";
import { useAuth } from "../../context/auth";
import ModalConfirmacao from "../../components/modalConfirmacao/ModalConfirmacao";
import { getApiErrorMessage } from "../../services/api";

function DetalhesEvento() {
    const { id = "" } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const { autenticado, usuario } = useAuth();

    // Estados do Evento e Comentários
    const [evento, setEvento] = useState<Evento | null>(null);
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [secaoComentarios, setSecaoComentarios] = useState<boolean>(false);
    
    // Estados de Inscrição e Presença
    const [presenca, setPresenca] = useState<Presenca null |>(null);
    const [presencaCarregada, setPresencaCarregada] = useState<string>("");
    const [enviandoInscricao, setEnviandoInscricao] = useState(false);
    const [mensagemInscricao, setMensagemInscricao] = useState("");
    const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false);

    // Estados de Carregamento Geral da Tela
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

    // 1. Busca os dados do evento e comentários
    useEffect(() => {
        async function carregar() {
            if (!id) return;

            setCarregando(true);
            setErro("");

            try {
                const [eventoAtual, comentariosAtuais] = await Promise.all([
                    eventoService.buscar(id),
                    comentarioService.listarPorEvento(id)
                ]);

                setEvento(eventoAtual);
                setComentarios(comentariosAtuais);
            } catch (error: any) {
                setErro(error?.response?.data || "Erro ao carregar informações do evento.");
            } finally {
                setCarregando(false);
            }
        }

        void carregar();
    }, [id]);

    // 2. Busca a presença do usuário logado neste evento
    useEffect(() => {
        if (!usuario || !id) return;
        const chave = `${usuario.idUsuario}:${id}`;
        let ativo = true;

        presencaService
            .listarPorUsuario(usuario.idUsuario)
            .then((items) => {
                if (ativo) setPresenca(items.find((item) => item.idEvento === id) ?? null);
            })
            .catch(() => {
                if (ativo) setPresenca(null);
            })
            .finally(() => {
                if (ativo) setPresencaCarregada(chave);
            });

        return () => {
            ativo = false;
        };
    }, [id, usuario]);

    function exigirLogin() {
        if (autenticado) return false;
        navigate("/login", { state: { from: location.pathname } });
        return true;
    }

    async function inscrever() {
        if (exigirLogin() || !usuario || !evento || presenca) return;
        setEnviandoInscricao(true);
        setMensagemInscricao("");

        try {
            const novaPresenca = await presencaService.cadastrar({
                situacao: true,
                idEvento: evento?.idEvento || "",
                idUsuario: usuario?.idUsuario || ""
            });
            setPresenca(novaPresenca);
            setMensagemInscricao("Inscrição realizada com sucesso.");
        } catch (error: any) {
            setMensagemInscricao(error?.response?.data || "Erro ao realizar inscrição.");
        } finally {
            setEnviandoInscricao(false);
        }
    }

    async function cancelarInscricao() {
        if (!presenca || enviandoInscricao) return;
        setEnviandoInscricao(true);
        setMensagemInscricao("");

        try {
            await presencaService.excluir(presenca.idPresenca);
            setPresenca(null);
            setMensagemInscricao("Inscrição cancelada com sucesso.");
        } catch (error) {
            setMensagemInscricao(getApiErrorMessage(error));
        } finally {
            setConfirmandoCancelamento(false);
            setEnviandoInscricao(false);
        }
    }

    const chavePresenca = usuario && id ? `${usuario.idUsuario}:${id}` : "";
    const checandoPresenca = Boolean(chavePresenca && presencaCarregada !== chavePresenca);

    return (
        <>
            <Header/>
            <main>
                <Link to="/eventos">Voltar aos eventos</Link>

                <img src={evento?.imagemUrl || imagemPadrao} alt="Banner do evento" />
                <h1>{evento?.nome}</h1>

                <div>
                    <button onClick={() => setSecaoComentarios(false)}>Sobre o Evento</button>
                    <button onClick={() => setSecaoComentarios(true)}>Comentários</button>

                    {secaoComentarios ? (
                        <div>
                            <h2>Comentários:</h2>
                            {comentarios.length === 0 ? (
                                <p>Nenhum comentário ainda.</p>
                            ) : (
                                comentarios.map((c) => (
                                    <p key={c.idComentario}>{c.descricao}</p>
                                ))
                            )}
                        </div>
                    ) : (
                        <p>{evento?.descricao}</p>
                    )}
                </div>

                <div>
                    <h2>Informações principais</h2>
                    <hr />

                    <div><img src={relogio} alt="" /><span>{evento?.dataEvento}</span></div>

                    <div><img src={predio} alt="" /><span>{evento?.idInstituicaoNavigation?.nomeFantasia}</span></div>

                    <div><img src={filtro} alt="" /><span>{evento?.idTipoEventoNavigation?.titulo}</span></div>

                    {erro && <p className="detalhe-evento-erro">{erro}</p>}

                    <Botao ""} "detalhe-evento-cancelar" : ? className="{presenca" disabled="{checandoPresenca" enviandoInscricao} onClick="{()" type="button" ||> (presenca ? setConfirmandoCancelamento(true) : void inscrever())}
                        texto={
                            checandoPresenca
                                ? "Verificando inscrição..."
                                : presenca
                                ? "Cancelar Inscrição"
                                : enviandoInscricao
                                ? "Inscrevendo..."
                                : "Inscrever-se"
                        }
                    />

                    {mensagemInscricao && (
                        <p className="detalhe-evento-mensagem" role="status">
                            {mensagemInscricao}
                        </p>
                    )}
                </div>

                <ModalConfirmacao "${evento?.nome "Cancelando..." "Cancelar "este : ? Inscrição"} cancelar em evento"}?"`} inscrição mensagem="{`Deseja" onClose="{()" show="{confirmandoCancelamento}" sua textoCancelar="Manter inscrição" textoConfirmar="{enviandoInscricao" titulo="Cancelar inscrição" ||> {
                        if (!enviandoInscricao) setConfirmandoCancelamento(false);
                    }}
                    onConfirm={() => void cancelarInscricao()}
                />
            </main>
            <Footer/>
        </>
    );
}

export default DetalhesEvento;