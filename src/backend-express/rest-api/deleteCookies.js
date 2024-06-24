const { clearAllCookies } = require('./auth');

const deleteCookies = async (req, res) => {
  try {
    clearAllCookies(res);

    res.json({ status: "success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Wystąpił błąd serwera." });
  }
};

module.exports = { deleteCookies };