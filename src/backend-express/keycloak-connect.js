const Keycloak = require("keycloak-connect");
require('dotenv').config();
// !!!!!!!!!!!!!!!!!!
// DODAC TU POZNIEJ PO PROSTU PRZEZ ZMIENNE SRODOWISKOWE W DOCKER COMPOSE

const config = {
    "realm": process.env.KEYCLOAK_REALM,
    "auth-server-url": `${process.env.KEYCLOAK_URL}`,
    "ssl-required": "external",
    "resource": process.env.KEYCLOAK_CLIENT,
    "bearer-only": true
};

module.exports = new Keycloak({}, config);