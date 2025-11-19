import axios, { AxiosInstance, AxiosResponse } from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          toast.error("Sessão expirada. Faça login novamente.");
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error.message) {
          toast.error(error.message);
        } else {
          toast.error("Ocorreu um erro inesperado.");
        }
        return Promise.reject(error);
      }
    );
  }

  public async get<T>(url: string, params?: any): Promise<AxiosResponse<T>> {
    return this.api.get(url, { params });
  }

  public async post<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.api.post(url, data);
  }

  public async put<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.api.put(url, data);
  }

  public async delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.api.delete(url);
  }

  public async patch<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.api.patch(url, data);
  }
}

export const api = new ApiService();
export default api;
