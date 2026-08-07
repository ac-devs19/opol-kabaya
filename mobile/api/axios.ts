import axiosClient from "axios";
import { getToken } from "@/services/auth-storage";

const axios = axiosClient.create({
  baseURL: "http://192.168.0.120:8000/api/kabaya/mobile",
  headers: {
    Accept: "application/json",
  },
});

axios.interceptors.request.use(async (req) => {
  const token = await getToken();
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default axios;
