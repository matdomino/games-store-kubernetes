const { verifyAuth } = require('../auth');

const getSupportList = async (req, res, pendingSupportCollection) => {
  try {
    const isValidLogin = await verifyAuth(req, res);

    if (isValidLogin === true) {
      const list = await pendingSupportCollection.find().toArray();

      res.json({ list: list });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Wystąpił błąd serwera." });
  }
};

module.exports = { getSupportList };