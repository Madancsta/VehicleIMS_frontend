import axios from "axios";

const API_BASE_URL = "http://localhost:5229/api";

export const searchCustomers = async (query) => {
  const response = await axios.get(
    `${API_BASE_URL}/Customer/search`,
    {
      params: { query },
    }
  );

  return response.data;
};

export const getCustomerById = async (id) => {
  const response = await axios.get(
    `${API_BASE_URL}/Customer/${id}`
  );

  return response.data;
};

export const getHighSpenders = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/Customer/reports/high-spenders`
  );

  return response.data;
};

export const getPendingCredits = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/Customer/reports/pending-credits`
  );

  return response.data;
};

export const getRegularCustomers = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/Customer/reports/regulars`
  );

  return response.data;
};