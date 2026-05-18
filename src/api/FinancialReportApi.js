import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5229/api";

export const getFinancialReport = async () => {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");

  const response = await axios.get(`${API_BASE_URL}/FinancialReport`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};