# Games Store web aplication (with added Kubernetes)
## Contents
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Endpoints Description](#endpoints-description)
4. [Author](#author)

## Introduction
A web application of a digital games store.

___Note: This project is an extension of my previous web application. In this version, I focused on integrating Kubernetes to add scalability and manageability. You can find the original project at the following link: [Github](https://github.com/matdomino/games-store).___

___The complete documentation is available in both TeX and PDF formats, written in Polish (main.pdf, main.tex).___

![Main page](https://i.imgur.com/ESQwS5A.png)

### Used technology:
- Next.js, React,
- Node.js, express,
- Jsonwebtoken,
- MognoDB,
- Nginx,
- Kubernetes,


## Installation
Follow the steps below to run the application using Kubernetes:

### Step 1
Set Up Kubernetes Secret for API Key Management
```
kubectl create secret generic gs-express-server-secret \
  --from-literal=TOKEN_KEY="YOUR_API_KEY"
```

### Step 2
Set up cluster with bash script in `/src/kubernetes/` directory:
```
./start.sh
```

### Step 3
Set up database collections and example employee user:
```
kubectl exec <mongo-pod> -- mongosh games-store-db ./setup/dbInit.mongodb.js
```

### Step 4
Access the app at link below:
#### [http://localhost/](http://localhost/)

## Endpoints description
### Database queries examples in Postman:
`/backend-express/GamesStore.postman_collection.json`

### Pages

`/addbalance` - Add balance to wallet.

`/adminpanel` - Panel for employee users to add games to database.

`/game/[gameId]` - Selected game details.

`/history` - User's transaction history.

`/library` - Library with games owned by user.

`/login` - Login/register page.

`/notifications` - User's notifications list.

`/profile` - Panel to change username, password, email, billingInfo.

`/returngame/[gameId]` - Form to return selected game.

`/sendsupportmsg` - Form to send support messages.

`/shoppingcart` - Page with current user's shopping cart.

`/store` - Main store page to browse games. 

`/support` - Page with pending/closed support messages

`/wallet` - Wallet info and options.

## Author
* ### Mateusz Domino: [LinkedIn](https://www.linkedin.com/in/mateusz-domino-214927270/)
* ### Email: [matdomino@outlook.com](mailto:matdomino@outlook.com)