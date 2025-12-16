import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true, // Equivalent to credentials: 'include'
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosInstance;
