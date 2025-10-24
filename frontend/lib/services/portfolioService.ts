import { api } from "@/lib/api";
import { type PortfolioItem, type PortfolioItemCreate, type PortfolioItemUpdate } from "@/types/portfolio";

class PortfolioService {
  async getMyPortfolio(): Promise<PortfolioItem[]> {
    const response = await apiClient.get<PortfolioItem[]>("/professional/portfolio");
    return response.data;
  }

  async createPortfolioItem(data: PortfolioItemCreate): Promise<PortfolioItem> {
    const response = await apiClient.post<PortfolioItem>("/professional/portfolio", data);
    return response.data;
  }

  async updatePortfolioItem(id: string, data: PortfolioItemUpdate): Promise<PortfolioItem> {
    const response = await apiClient.put<PortfolioItem>(
      `/professional/portfolio/${id}`,
      data
    );
    return response.data;
  }

  async deletePortfolioItem(id: string): Promise<void> {
    await apiClient.delete(`/professional/portfolio/${id}`);
  }

  async uploadPortfolioImage(id: string, image: File): Promise<PortfolioItem> {
    const formData = new FormData();
    formData.append("file", image);

    const response = await api.post<PortfolioItem>(
      `/professional/portfolio/${id}/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }
}

export const portfolioService = new PortfolioService();
