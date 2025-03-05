
import axios from "axios";

const API_BASE_URL = "/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiRequest = {
  get: async (url: string) => {
    const response = await apiClient.get(url);
    return response.data;
  },
  post: async (url: string, data: any) => {
    const response = await apiClient.post(url, data);
    return response.data;
  },
  put: async (url: string, data: any) => {
    const response = await apiClient.put(url, data);
    return response.data;
  },
  delete: async (url: string) => {
    const response = await apiClient.delete(url);
    return response.data;
  },
};
