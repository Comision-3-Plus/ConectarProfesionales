export interface PortfolioImage {
  id: string;
  imagen_url: string;
  orden: number;
}

export interface PortfolioItem {
  id: string;
  profesional_id: string;
  titulo: string;
  descripcion: string | null;
  fecha_creacion: string;
  imagenes: PortfolioImage[];
}

export interface PortfolioItemCreate {
  titulo: string;
  descripcion?: string | null;
}

export interface PortfolioItemUpdate {
  titulo?: string;
  descripcion?: string | null;
}
