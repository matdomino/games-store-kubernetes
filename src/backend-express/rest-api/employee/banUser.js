const { verifyAuth } = require('../auth');

const banUser = async (req, res, usersCollection, ObjectId) => {
  try {
    const isValidLogin = await verifyAuth(req, res);

    if (isValidLogin === true) {

      const deletedUser = await usersCollection.deleteOne({ _id: new ObjectId(req.params.id) });

      if (deletedUser.deletedCount === 1) {
        res.json({ status: 'success' });
      } else {
        res.status(404).json({ error: "Nie znaleziono użytkownika o podanym id" });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Wystąpił błąd serwera." });
  }
};

module.exports = { banUser };