import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import keycloak from './keycloak';

const root = createRoot(document.getElementById('root'))
  // Inicializamos Keycloak antes de arrancar React
// 'login-required' fuerza a que si no hay sesión, te redirija automáticamente a la pantalla de Login
keycloak.init({ onLoad: 'login-required' })
    .then((authenticated) => {
        if (!authenticated) {
            window.location.reload();
        } else {
            console.log("¡Usuario autenticado con éxito!");
            
            // Solo si está logueado, dibujamos la aplicación
            root.render(
                <StrictMode>
                    <App />
                </StrictMode>
            );
        }
    })
    .catch((error) => {
        console.error("Fallo al inicializar Keycloak", error);
    })

