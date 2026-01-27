import L from 'leaflet';

export interface State {
    codigo_uf: number;
    nome: string;
    sigla: string;
    flag_url: string;
    regiao: string;
}

export interface MunicipalData {
    id: string;
    nome: string;
    value: number;
}

export interface HoveredCity {
    nome: string;
    codigo: string;
    densidade: number;
}

export interface GeoJSONFeature {
    type: string;
    geometry: any;
    properties: {
        codarea?: string;
        id?: string;
        name?: string;
        NM_MUN?: string;
        NM_ESTADO?: string;
        [key: string]: any;
    };
    id?: string;
}

export interface CnaeRanking {
    label: string;
    value: number;
}

export interface PorteDistribution {
    label: string;
    value: number;
}

export interface StateStats {
    capital: number;
    natalidade: number;
    survival: number;
    topCnaes: CnaeRanking[];
    porteDist: PorteDistribution[];
}
