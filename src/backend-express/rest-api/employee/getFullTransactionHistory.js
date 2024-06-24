const { verifyAuth } = require('../auth');

const getFullTransactionHistory = async (req, res, transactionsCollection) => {
  try {
    const isValidLogin = await verifyAuth(req, res);

    if (isValidLogin === true) {
      const list = await transactionsCollection.find().toArray();

      res.json({ list: list });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Wystąpił błąd serwera." });
  }
};

module.exports = { getFullTransactionHistory };