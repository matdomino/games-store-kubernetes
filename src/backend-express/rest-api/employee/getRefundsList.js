const { verifyAuth } = require('../auth');

const getRefundsList = async (req, res, pendingReturnsCollection) => {
  try {
    const isValidLogin = await verifyAuth(req, res);

    if (isValidLogin === true) {
      const list = await pendingReturnsCollection.find().toArray();

      res.json({ list: list });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Wystąpił błąd serwera." });
  }
};

module.exports = { getRefundsList };