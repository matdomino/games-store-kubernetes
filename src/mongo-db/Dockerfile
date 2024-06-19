FROM mongo

COPY dbInit.mongodb.js /docker-entrypoint-initdb.d/dbInit.mongodb.js

ENV MONGO_INITDB_DATABASE=games-store-db