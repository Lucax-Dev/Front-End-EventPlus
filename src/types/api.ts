export interface TipoEvento {
    idTipoEvento: string;
    titulo: string;
}

export interface TipoUsuario {
    idTipoUsuario: string;
    titulo: string;
}

export interface Instituicao {
    idInstituicao: string;
    cnpj: string;
    nomeFantasia: string;
    endereco: string;
}

export interface Usuario {
    idUsuario: string;
    nome: string;
    email: string;
    idTipoUsuario?: string;
    idTipoUsuarioNavigation? : TipoUsuario | null;
}

export interface Evento {
    idEvento: string;
    nome: string;
    descricao: string;
    dataEvento: string;
    imagemUrl?: string | null;
    idTipoEvento?: string | null;
    idTipoEventoNavigation?: TipoEvento | null;
    idInstituicao?: string | null;
    idInstituicaoNavigation?: Instituicao | null;
}

export interface Presenca {
    idPresenca: string;
    situacao: boolean;
    idEvento: string;
    idUsuario?: string | null;
    idEventoNavigation?: Evento | null;
}

export interface LoginPayload{
    email:string;
    senha: string;
}

export interface LoginResponse {
    token: string;
    expiracao: string;
    usuario: Usuario;
}

export interface AuthSession extends LoginResponse {
    usuario: Usuario,
}

export interface PresencaPayload {
    situacao: boolean;
    idEvento: string;
    idUsuario: string | null;
}