import { useEffect, useState } from "react";
import { eventoService } from "../../services/eventPlusservice";
import type { Evento } from "../../types/api";

import "./Eventos.css"

import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import CardEvento from "../../components/cardEvento/CardEvento";

function Eventos() {
    const [eventos, setEventos] = useState<Evento[]>([])


    useEffect(() => {
        async function carregar() {
            const dados = await eventoService.listar();

            setEventos(dados);
        }

        void carregar();

    }, [])

    return (
        <>
            <Header />
            <main>
                <div className="container-eventos">
                    <h1>Catálogo de eventos</h1>
                    <div className="eventos">
                        {eventos.map((evento) => (
                            <CardEvento
                                key={evento.idEvento}
                                id={evento.idEvento}
                                imagem={evento.imagemUrl}
                                categoria={evento.idTipoEventoNavigation?.titulo}
                                titulo={evento.nome}
                                descricao={evento.descricao} />
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}

export default Eventos;