import axios from "axios";

const API_URL = "http://localhost:4000/api/auth"; 


export const loginUser = async (email, password) => {
  const response = await axios.post(
    `${API_URL}/login`,
    { email, password },
    { withCredentials: true } 
  );
  return response.data;
};


export const logoutUser = async () => {
  const response = await axios.post(
    `${API_URL}/logout`,
    {},
    { withCredentials: true }
  );
  return response.data;
};

export const checkAuth = async () => {
  try {
    const response = await axios.get(`${API_URL}/is-auth`, { withCredentials: true });
    return response.data;
  } catch (err) {
    return { success: false };
  }
};
