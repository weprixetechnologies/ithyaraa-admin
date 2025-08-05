// utils/axios.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3300/api/',
    timeout: 10000
});

export default axiosInstance;
