const { verifyAuth } = require('./auth');

const getUserData = (req, res, usersCollection) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isValidLogin = await verifyAuth(req, res);

      if (isValidLogin === true) {
        const user = req.cookies.username;
        const userData = await usersCollection.findOne(
          { "username": user },
          {
            projection: {
              _id: 0,
              email: 1,
              username: 1,
              role: 1,
              address: 1
            }
          }
        );

        if (userData) {
          resolve({ status: "success", data: userData });
        } else {
          reject({ status: 500, error: "Wystąpił błąd podczas pobierania informacji" });
        }
      }
    } catch (err) {
      console.error(err);
      reject({ status: 500, error: "Wystąpił błąd serwera." });
    }
  });
};

module.exports = { getUserData };
