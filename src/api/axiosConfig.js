import axios from 'axios';
import keycloak from '../keycloak';

// Asegúrate de que este puerto (7148) coincide con el que usa tu .NET al arrancar
const api = axios.create({
    baseURL: 'https://localhost:7148/api', 
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    async (config) => {
        // Verificamos si Keycloak está inicializado y tiene un token
        if (keycloak.token) {
            try {
                // Si al token le quedan menos de 30 segundos de vida, pedimos uno nuevo a Keycloak
                await keycloak.updateToken(30);
                
                // Inyectamos el token en las cabeceras HTTP
                config.headers.Authorization = `Bearer ${keycloak.token}`;
            } catch (error) {
                console.error("Error al actualizar el token. Redirigiendo a login...", error);
                keycloak.login(); // Si falla la renovación, lo mandamos a loguearse de nuevo
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;