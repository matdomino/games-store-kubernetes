const login = async (req, res, usersCollection, keycloak) => {
  try {
    const { user, pass } = req.body;

    const grant = await keycloak.grantManager.obtainDirectly(user, pass);

    let existingUser = await usersCollection.findOne({ username: user });

    if (!existingUser) {
      const newUser = {
        username: user,
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

    const roles = grant.access_token.content?.realm_access?.roles || [];
    const isEmployee = roles.includes('employee');

    res.cookie('accessToken', grant.access_token.token, {
      httpOnly: true,
      maxAge: 5 * 60 * 1000,
    });

    res.cookie('refreshToken', grant.refresh_token.token, {
      httpOnly: true,
      maxAge: 30 * 60 * 1000,
    });

    res.cookie('username', user, {
      maxAge: 30 * 60 * 1000
    });

    res.cookie('roleType', isEmployee ? 'employee' : 'user', {
      maxAge: 30 * 60 * 1000,
    });

    res.cookie('walletBalance', existingUser.walletBalance, {
      maxAge: 30 * 60 * 1000,
    });

    res.json({
      message: "User Login Successful",
      status: true,
      access_token: grant.access_token.token,
      refresh_token: grant.refresh_token.token,
      user_id: grant.access_token.content.sub,
      role: grant.access_token.content?.realm_access?.roles,
    });

  } catch (err) {
    if (err.name === 'AuthenticationError') {
      res.status(401).json({
        message: "Authentication failed",
        error: err,
        status: false,
        access_token: null,
        refresh_token: null,
        user_id: null,
      });
    } else {
      console.error(err);
      res.status(500).json({ error: "Server error occurred." });
    }
  }
};


module.exports = { login };