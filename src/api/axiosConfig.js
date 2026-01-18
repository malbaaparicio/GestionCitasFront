import axios from 'axios';

// Asegúrate de que este puerto (7148) coincide con el que usa tu .NET al arrancar
const api = axios.create({
    baseURL: 'https://localhost:7148/api', 
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;