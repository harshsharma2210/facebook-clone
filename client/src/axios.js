import axios from "axios";

const instance = axios.create({
  baseURL: process.env.baseURL,
});

export default instance;
