import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import type { Evento, instituicao, TipoEvento, AuthSession } from "../../types/api";
import { eventoService, instituicaoService, tipoEventoService } from "../../services/eventPlusservice";
import { getApiErrorMessage, SESSION_STORAGE_KEY } from "../../services/api";
import Campo from "../../components/campo/Campo";
import Botao from "../../components/botao/Botao";
import CardEvento from "../../components/cardEvento/CardEvento";
import ModalConfirmacao from "../../components/modalConfirmacao/ModalConfirmacao";

// ID do perfil Administrador no sistema
const ID_ADMINISTRADOR = "39f32459-db67-4c76-926c-0047a53137e3";

interface FormularioEvento {
    nome: string;
    dataEvento: string;
    descricao: string;
    idTipoEvento: string;
    idInstituicao: string;
    arquivoImagem: File | null;
}

const inicial: FormularioEvento = {
    nome: "",
    dataEvento: "",
    descricao: "",
    idTipoEvento: "",
    idInstituicao: "",
    arquivoImagem: null
};

function paraDataLocal(value: string) {
    const data = new Date(value);
    if (Number.isNaN(data.getTime())) return value.slice(0, 16);
    const local = new Date(data.getTime() - data.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
}

function CadastroEvento() {
    const navigate = useNavigate();
    const fotoInputRef = useRef<HTMLInputElement>(null);

    // Substitua a verificação eAdmin do topo do CadastroEvento por esta:
    const sessionData = localStorage.getItem(SESSION_STORAGE_KEY);
    const session: any = sessionData ? JSON.parse(sessionData) : null;

    const idTipoUsuario = session?.idTipoUsuario || session?.usuario?.idTipoUsuario;
    const eAdmin = idTipoUsuario === ID_ADMINISTRADOR || session?.titulo === "Administrador" || session?.usuario?.titulo === "Administrador";

    useEffect(() => {
        if (!session || !eAdmin) {
            navigate("/home");
        }
    }, [session, eAdmin, navigate]);

    const [formulario, setFormulario] = useState(inicial);
    const [tipos, setTipos] = useState<TipoEvento[]>([]);
    const [instituicoes, setInstituicoes] = useState<instituicao[]>([]);
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [idEmedicao, setIdEmEdicao] = useState<string | null>(null);
    const [selecionado, setSelecionado] = useState<Evento | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [progresso, setProgresso] = useState(0);
    const [mensagem, setMensagem] = useState("");

    const carregar = useCallback(async () => {
        setCarregando(true);
        setMensagem("");
        try {
            const [tiposApi, instituicoesApi, eventosApi] = await Promise.all([
                tipoEventoService.listar(),
                instituicaoService.listar(),
                eventoService.listar()
            ]);

            setTipos(tiposApi);
            setInstituicoes(instituicoesApi);
            setEventos(eventosApi);
            setFormulario((value) => ({
                ...value,
                idTipoEvento: value.idTipoEvento || tiposApi[0]?.idTipoEvento || "",
                idInstituicao: value.idInstituicao || instituicoesApi[0]?.idInstituicao || ""
            }));
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        if (eAdmin) {
            const timeout = window.setTimeout(() => void carregar(), 0);
            return () => window.clearTimeout(timeout);
        }
    }, [carregar, eAdmin]);

    // Impede a renderização dos elementos se o utilizador não for Administrador
    if (!session || !eAdmin) {
        return null;
    }

    function atualizar(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setFormulario((value) => ({ ...value, [event.target.name]: event.target.value }));
    }

    function limparFormulario() {
        setFormulario({
            ...inicial,
            idTipoEvento: tipos[0]?.idTipoEvento || "",
            idInstituicao: instituicoes[0]?.idInstituicao || "",
        });
        setIdEmEdicao(null);
        setProgresso(0);
        if (fotoInputRef.current) fotoInputRef.current.value = "";
    }

    function editar(evento: Evento) {
        setIdEmEdicao(evento.idEvento);
        setFormulario({
            nome: evento.nome,
            dataEvento: paraDataLocal(evento.dataEvento),
            descricao: evento.descricao,
            idTipoEvento: evento.idTipoEvento || evento.idTipoEventoNavigation?.idTipoEvento || "",
            idInstituicao: evento.idInstituicao || evento.idInstituicaoNavigation?.idInstituicao || "",
            arquivoImagem: null
        });
        if (fotoInputRef.current) fotoInputRef.current.value = "";
        setMensagem(`Editando "${evento.nome}".`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function salvar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setEnviando(true);
        setMensagem("");
        setProgresso(0);

        try {
            const eventoAtual = eventos.find((item) => item.idEvento === idEmedicao);
            const payload = {
                nome: formulario.nome.trim(),
                descricao: formulario.descricao.trim(),
                dataEvento: new Date(formulario.dataEvento).toISOString(),
                idTipoEvento: formulario.idTipoEvento,
                idInstituicao: formulario.idInstituicao,
                arquivoImagem: formulario.arquivoImagem,
                imagemUrl: formulario.arquivoImagem ? null : eventoAtual?.imagemUrl
            };

            if (idEmedicao) await eventoService.atualizar(idEmedicao, payload, setProgresso);
            else await eventoService.cadastrar(payload, setProgresso);

            const mensagemSucesso = idEmedicao ? "Evento atualizado com sucesso." : "Evento cadastrado com sucesso.";

            limparFormulario();
            setEventos(await eventoService.listar());
            setMensagem(mensagemSucesso);
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
        } finally {
            setEnviando(false);
            setProgresso(0);
        }
    }

    async function excluir() {
        if (!selecionado) return;
        setEnviando(true);
        setMensagem("");

        try {
            await eventoService.excluir(selecionado.idEvento);
            if (idEmedicao === selecionado.idEvento) limparFormulario();
            setEventos(await eventoService.listar());
            setMensagem("Evento excluído com sucesso.");
            setSelecionado(null);
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
            setSelecionado(null);
        } finally {
            setEnviando(false);
        }
    }

    return (
        <>
            <Header />
            <main className="cadastro-evento-page">
                <section>
                    <h1>Administração de eventos</h1>
                    <p>Cadastre novos eventos ou selecione um item da lista para editar ou excluir</p>
                </section>

                <div>
                    <form onSubmit={salvar}>
                        <h2>{idEmedicao ? "Editar Evento" : "Cadastrar Evento"}</h2>
                        <div>
                            <label className="visually-hidden" htmlFor="evento-nome">
                                Nome
                            </label>
                            <Campo id="evento-nome" name="nome" value={formulario.nome} onChange={atualizar} placeholder="Nome" maxLength={100} required />
                            <label className="visually-hidden" htmlFor="evento-data">
                                Data e Horário
                            </label>
                            <Campo id="evento-data" name="dataEvento" type="datetime-local" value={formulario.dataEvento} onChange={atualizar} required />
                        </div>

                        <label className="visually-hidden" htmlFor="evento-descricao">Descrição</label>
                        <Campo id="evento-descricao" name="descricao" value={formulario.descricao} onChange={atualizar} placeholder="Descrição" required />

                        <div>
                            <label>
                                <span className="visually-hidden">Tipo de Evento</span>
                                <select name="idTipoEvento" value={formulario.idTipoEvento} onChange={atualizar} required>
                                    <option value="">Tipo Evento</option>
                                    {tipos.map((tipo) => <option value={tipo.idTipoEvento} key={tipo.idTipoEvento}>{tipo.titulo}</option>)}
                                </select>
                            </label>
                            <label>
                                <span className="visually-hidden">Instituição</span>
                                <select name="idInstituicao" value={formulario.idInstituicao} onChange={atualizar} required>
                                    <option value="">Instituição</option>
                                    {instituicoes.map((inst) => <option value={inst.idInstituicao} key={inst.idInstituicao}>{inst.nomeFantasia}</option>)}
                                </select>
                            </label>
                        </div>

                        <label htmlFor="foto-evento">
                            <span>{formulario.arquivoImagem?.name || (idEmedicao ? "Manter a foto atual ou escolher outra" : "Foto")}</span>
                        </label>
                        <input ref={fotoInputRef} id="foto-evento" className="visually-hidden" type="file" accept="image/*" onChange={(event) => setFormulario((value) => ({ ...value, arquivoImagem: event.target.files?.[0] || null }))} />

                        <Botao texto={enviando ? progresso ? `Enviando ${progresso}%` : "Salvando..." : idEmedicao ? "Salvar alterações" : "Cadastrar"} type="submit" disabled={enviando || carregando} />
                        {idEmedicao ? <button className="cadastro-evento-cancelar" type="button" onClick={() => { limparFormulario(); setMensagem(""); }}>Cancelar Edição</button> : null}
                        {mensagem ? <p role="status">{mensagem}</p> : null}
                    </form>
                </div>

                <section>
                    <h2>Eventos cadastrados</h2>
                    {carregando ? <p>Carregando dados...</p> : null}
                    {!carregando && eventos.length === 0 ? <p>Nenhum evento cadastrado.</p> : null}
                    <div>
                        {eventos.map((evento) => (
                            <CardEvento
                                key={evento.idEvento}
                                id={evento.idEvento}
                                imagem={evento.imagemUrl}
                                categoria={evento.idTipoEventoNavigation?.titulo}
                                titulo={evento.nome}
                                descricao={evento.descricao}
                                emEdicao={idEmedicao === evento.idEvento}
                                onEditar={() => editar(evento)}
                                onExcluir={() => setSelecionado(evento)}
                            />
                        ))}
                    </div>
                </section>

                <ModalConfirmacao
                    show={Boolean(selecionado)}
                    titulo="Excluir evento"
                    mensagem={selecionado ? `Deseja realmente excluir "${selecionado.nome}"? As inscrições e os comentários vinculados também serão removidos.` : ""}
                    textoConfirmar={enviando ? "Excluindo..." : "Excluir evento"}
                    textoCancelar="Cancelar"
                    onClose={() => setSelecionado(null)}
                    onConfirm={() => void excluir()}
                />
            </main>
            <Footer />
        </>
    );
}

export default CadastroEvento;