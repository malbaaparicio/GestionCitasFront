import Keycloak from 'keycloak-js';

// Configuramos los datos exactos del Realm y Client que creamos en Docker
const keycloak = new Keycloak({
    url: 'http://localhost:8080',
    realm: 'PeluqueriaSaaS',
    clientId: 'react-frontend'
});

export default keycloak;