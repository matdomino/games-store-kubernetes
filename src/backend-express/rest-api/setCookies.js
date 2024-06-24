const setCookies = async (req, res, usersCollection) => {
  try {
    const grant = req.kauth.grant;
    const user = grant.access_token.content.preferred_username;
    const roles = grant.access_token.content.realm_access.roles;

    let existingUser = await usersCollection.findOne({ username: user });

    if (!existingUser) {
      const newUser = {
        username: user,
        role: roles.includes('employee') ? 'employee' : 'user',
        walletBalance: 0,
        address: {
          firstName: null,
          lastName: null,
          city: null,
          street: null,
          home: null,
          flat: null,
          postCode: null
        },
        games: [],
        favouriteGames: [],
        transactions: [],
        support: [],
        notifications: [],
        shoppingCart: []
      };

      await usersCollection.insertOne(newUser);

      existingUser = await usersCollection.findOne({ username: user });
    }

    res.cookie('username', user, {
      maxAge: 30 * 60 * 1000
    });

    res.cookie('walletBalance', existingUser.walletBalance, {
      maxAge: 30 * 60 * 1000,
    });

    res.json({
      message: "Cookies set",
      status: true,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Wystąpił błąd serwera." });
  }
};


module.exports = { setCookies };