const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const KeycloakConnect = require('keycloak-connect');
const { setCookies } = require('./rest-api/setCookies');
const { checkRole } = require('./rest-api/auth');
const { deleteCookies } = require('./rest-api/deleteCookies');
const { getUsers } = require('./rest-api/employee/getUsersList');
const { getUser } = require('./rest-api/employee/getUser');
const { banUser } = require('./rest-api/employee/banUser');
const { addGame } = require('./rest-api/employee/addGame');
const { getSupportList } = require('./rest-api/employee/getSupportList');
const { respondToSupport } = require('./rest-api/employee/respondToSupport');
const { getRefundsList } = require('./rest-api/employee/getRefundsList');
const { respondToRefund } = require('./rest-api/employee/respondToRefund');
const { getFullTransactionHistory } = require('./rest-api/employee/getFullTransactionHistory');
const { getGames } = require('./rest-api/getGames');
const { searchGames } = require('./rest-api/searchGames');
const { getGameDetails } = require('./rest-api/getGameDetails');
const { addToCart } = require('./rest-api/addToCart');
const { deleteFromCart } = require('./rest-api/deleteFromCart');
const { checkOut } = require('./rest-api/checkOut');
const { clearNotifications } = require('./rest-api/clearNotifications');
const { getNotifications } = require('./rest-api/getNotifications');
const { getUserData } = require('./rest-api/getUserData');
const { getWalletBalance } = require('./rest-api/getWalletBalance');
const { changeAdress } = require('./rest-api/changeAdress');
const { addBalance } = require('./rest-api/addBalance');
const { finalizeOrder } = require('./rest-api/finalizeOrder');
const { getOwnedGames } = require('./rest-api/getOwnedGames');
const { addToFavourites } = require('./rest-api/addToFavourites');
const { reviewGame } = require('./rest-api/reviewGame');
const { returnGame } = require('./rest-api/returnGame');
const { sendSupportMsg } = require('./rest-api/sendSupportMsg');
const { getHistory } = require('./rest-api/getHistory');
const { getHistoryDetails } = require('./rest-api/getHistoryDetails');
const { getSupportMsgs } = require('./rest-api/getSupportMsgs');
const { getRefunds } = require('./rest-api/getRefunds');


const app = express();
const port = 8000;
app.use(cors({
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  origin: 'http://localhost:8080'
}));

// PRZENIESC CONFIG DO INNEGO PLIKU LUB DO ZMIENNYCH
const keycloakConfig = {
  clientId: `games-store-api`,
  bearerOnly: true,
  serverUrl: `http://localhost:8080`,
  realm: `games-store`,
  credentials: {
    secret: `AEJV8XyKkoPzIiL31eGMbf6yecAIlryq`,
  },
};

const keycloak = new KeycloakConnect({}, keycloakConfig);

app.use(bodyParser.json());
app.use(cookieParser());
app.use(keycloak.middleware());

// ZMIENIC URL BAZY!!!!!!!!!!!!!!!!
// const dbUrl = 'mongodb://mongo-db:27017/';
const dbUrl = 'mongodb://localhost:27017/';
const dbName = 'games-store-db';

async function connect() {
  try {
    const client = new MongoClient(dbUrl);
    const upload = multer();
    await client.connect();
    console.log('Pomyślnie połączono z bazą danych!');

    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    const gamesCollection = db.collection('games');
    const pendingSupportCollection = db.collection('pending-support');
    const closedSupportCollection = db.collection('closed-support');
    const pendingReturnsCollection = db.collection('pending-returns');
    const closedReturnsCollection = db.collection('closed-returns');
    const transactionsCollection = db.collection('transactions-history');

    app.delete('/deletecookies', async (req, res) => {
      await deleteCookies(req, res);
    });

    app.post('/setcookies', keycloak.protect(), async (req, res) => {
      await setCookies(req, res, usersCollection);
    });

    // --- EMPLOYEE ---

    app.get('/users', keycloak.protect(), checkRole('employee'), async (req, res) => {
      await getUsers(req, res, usersCollection);
    });

    app.get('/user/:id', keycloak.protect(), checkRole('employee'), async (req, res) => {
      await getUser(req, res, usersCollection, ObjectId);
    });

    app.delete('/banuser/:id', keycloak.protect(), checkRole('employee'), async (req, res) => {
      await banUser(req, res, usersCollection, ObjectId);
    });

    app.post('/addgame', keycloak.protect(), checkRole('employee'), upload.single('file'), async (req, res) => {
      await addGame(req, res, gamesCollection);
    });

    app.get('/getsupportlist', keycloak.protect(), checkRole('employee'), async (req, res) => {
      await getSupportList(req, res, pendingSupportCollection);
    });

    app.post('/respondtosupportmsg', keycloak.protect(), checkRole('employee'), async (req, res) => {
      await respondToSupport(req, res, pendingSupportCollection, closedSupportCollection, usersCollection, ObjectId);
    });

    app.get('/getrefundslist', keycloak.protect(), checkRole('employee'), async (req, res) => {
      await getRefundsList(req, res, pendingReturnsCollection);
    });

    app.post('/respondtorefund', keycloak.protect(), checkRole('employee'), async (req, res) => {
      await respondToRefund(req, res, pendingReturnsCollection, closedReturnsCollection, transactionsCollection, usersCollection, gamesCollection, ObjectId);
    });

    app.get('/transactionhistory', keycloak.protect(), checkRole('employee'), async (req, res) => {
      await getFullTransactionHistory(req, res, transactionsCollection);
    });

    // --- USER ---

    app.post('/storegames', keycloak.protect(), async (req, res) => {
      await getGames(req, res, gamesCollection);
    });

    app.post('/searchgames', keycloak.protect(), async (req, res) => {
      await searchGames(req, res, gamesCollection);
    });

    app.get('/gamedetails/:gameId', keycloak.protect(), async(req, res) => {
      await getGameDetails(req, res, gamesCollection, ObjectId);
    });

    app.put('/addgametocart/:gameId', keycloak.protect(), async (req, res) => {
      await addToCart(req, res, usersCollection, gamesCollection, ObjectId);
    });

    app.delete('/deletefromcart/:gameId', keycloak.protect(), async (req, res) => {
      await deleteFromCart(req, res, usersCollection);
    });

    app.get('/checkout', keycloak.protect(), async (req, res) => {
      await checkOut(req, res, usersCollection, gamesCollection, ObjectId);
    });

    app.delete('/clearnotifications', keycloak.protect(), async (req, res) => {
      await clearNotifications(req, res, usersCollection);
    });

    app.get('/notifications', keycloak.protect(), async (req, res) => {
      await getNotifications(req, res, usersCollection);
    });

    app.get('/getuserdata', keycloak.protect(), async (req, res) => {
      getUserData(req, res, usersCollection)
        .then(result => res.json(result))
        .catch(error => res.status(error.status).json({ error: error.error }));
    });

    app.get('/walletbalance', keycloak.protect(), async (req, res) => {
      getWalletBalance(req, res, usersCollection)
        .then(result => res.json(result))
        .catch(error => res.status(error.status).json({ error: error.error }));
    });

    app.put('/changeaddress', keycloak.protect(), async (req, res) => {
      changeAdress(req, res, usersCollection)
        .then(result => res.json(result))
        .catch(error => res.status(error.status).json({ error: error.error }));
    });

    app.put('/addbalance', keycloak.protect(), async (req, res) => {
      addBalance(req, res, usersCollection, transactionsCollection)
        .then(result => res.json(result))
        .catch(error => res.status(error.status).json({ error: error.error }));
    });

    app.post('/finalizeorder', keycloak.protect(), async (req, res) => {
      finalizeOrder(req, res, usersCollection, transactionsCollection, gamesCollection, ObjectId)
        .then(result => res.json(result))
        .catch(error => res.status(error.status).json({ error: error.error }));
    });

    app.get('/getownedgames', keycloak.protect(), async (req, res) => {
      getOwnedGames(req, res, usersCollection)
        .then(result => res.json(result))
        .catch(error => res.status(error.status).json({ error: error.error }));
    });

    app.post('/addtofavourites', keycloak.protect(), async (req, res) => {
      addToFavourites(req, res, usersCollection, ObjectId)
        .then(result => res.json(result))
        .catch(error => res.status(error.status).json({ error: error.error }));
    });

    app.post('/reviewgame', keycloak.protect(), async (req, res) => {
      reviewGame(req, res, usersCollection, gamesCollection, ObjectId)
        .then(result => res.json(result))
        .catch(error => res.status(error.status).json({ error: error.error }));
    });

    app.post('/returngame', keycloak.protect(), async (req, res) => {
      returnGame(req, res, usersCollection, pendingReturnsCollection)
        .then(result => res.json(result))
        .catch(error => res.status(error.status).json({ error: error.error }));
    });

    app.post('/sendsupportmsg', keycloak.protect(), async (req, res) => {
      sendSupportMsg(req, res, usersCollection, pendingSupportCollection)
        .then(result => res.json(result))
        .catch(error => res.status(error.status).json({ error: error.error }));
    });

    app.get('/gettransactionshistory', keycloak.protect(), async (req, res) => {
      getHistory(req, res, usersCollection)
        .then(result => res.json(result))
        .catch(error => res.status(error.status).json({ error: error.error }));
    });

    app.get('/gettransactiondetails/:transId', keycloak.protect(), async (req, res) => {
      getHistoryDetails(req, res, usersCollection, transactionsCollection, ObjectId)
        .then(result => res.json(result))
        .catch(error => res.status(error.status).json({ error: error.error }));
    });

    app.get('/getsupportmsgs/', keycloak.protect(), async (req, res) => {
      getSupportMsgs(req, res, usersCollection, pendingSupportCollection, closedSupportCollection, ObjectId)
        .then(result => res.json(result))
        .catch(error => res.status(error.status).json({ error: error.error }));
    });

    app.get('/getrefunds/', keycloak.protect(), async (req, res) => {
      getRefunds(req, res, usersCollection, pendingReturnsCollection, closedReturnsCollection, ObjectId)
        .then(result => res.json(result))
        .catch(error => res.status(error.status).json({ error: error.error }));
    });

    app.listen(port, () => {
      console.log(`Serwer działa na porcie: ${port}`);
    });
  } catch (err) {
    console.error('Wystąpił błąd podczas łączenia z bazą.', err);
  }
}

connect();