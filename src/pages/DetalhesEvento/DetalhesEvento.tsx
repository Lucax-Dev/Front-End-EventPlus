import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

import type { Evento, Presenca } from "../../types/api";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Botao from "../../components/botao/Botao";

import imagemPadrao from "../../assets/banner-1.png";

import relogio from "../../assets/icons/relogio.svg";
import predio from "../../assets/icons/predio.svg";
import filtro from "../../assets/icons/filtro.svg";

import "./DetalhesEvento.css";
import { eventoService } from "../../services/eventPlusservice"; 

function DetalhesEvento() {
    const { id = "" } = useParams();

    // Reimoĩva'erã usuario ne contexto-gui (ejemplo: useAuth)
    // const { usuario } = useAuth(); 
    const usuario = { idUsuario: "123" }; // Techapaha re-testea haguã

    const [evento, setEvento] = useState<Evento | null>(null);
    const [secaoComentarios, setSecaoComentarios] = useState<boolean>(false);
    const [presenca, setPresenca] = useState<Presenca | null>(null);
    const [presencaCarregada, setPresencaCarregada] = useState<string>("");
    const [confirmandoCancelamento, setConfirmandoCancelamento] = useState<boolean>(false);

    useEffect(() => {
        async function carregar() {
            if (!id) return;

            const dados = await eventoService.buscar(id);

            setEvento(dados);
        }

        void carregar();
    }, [id]);

    function mostrarEvento() {
        console.log(evento);
    }

    const chavePresenca = usuario && id ? `${usuario.idUsuario}:${id}` : "";
    const checandoPresenca = Boolean(chavePresenca && presencaCarregada !== chavePresenca);

    return (
        <>
            <Header />
            <main>
                <Link to="/eventos">Voltar aos eventos</Link>
            
                <img src={evento?.imagemUrl || imagemPadrao} alt="Banner do evento" />               
                <h1>{evento?.nome}</h1>
                
                <div>
                    <button onClick={() => setSecaoComentarios(false)}>Sobre o Evento</button>
                    <button onClick={() => setSecaoComentarios(true)}>Comentários</button>
                    
                    {secaoComentarios ? (
                        <h2>Comentários:</h2> 
                    ) : (
                        <>
                            <p>{evento?.descricao}</p>
                        </>
                    )}
                </div>

                <div>
                    <h2>Informações principais</h2>
                    <hr />

                    <div><img src={relogio} alt="" /><span>{evento?.dataEvento}</span></div>

                    <div><img src={predio} alt="" /><span>{evento?.idInstituicaoNavigation?.nomeFantasia}</span></div>

                    <div><img src={filtro} alt="" /><span>{evento?.idTipoEventoNavigation?.titulo}</span></div>

                    <Botao
                        className={presenca ? "detalhe-evento-cancelar" : ""}
                        texto={
                            confirmandoCancelamento 
                                ? "Confirmar Cancelamento" 
                                : presenca 
                                ? "Cancelar Inscrição" 
                                : "Inscrever-se"
                        }
                    />
                </div>

            </main>
            <Footer />
        </>
    );
}

export default DetalhesEvento;