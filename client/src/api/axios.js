import axios from "axios";

const api = axios.create({
  baseURL: "https://clyraa.onrender.com/api",
  withCredentials: true,
});

export default api;
