const login = async (req, res, keycloak) => {
  try {
    const { user, pass } = req.body;

      keycloak.grantManager
      .obtainDirectly(user, pass)
      .then((grant) => {
        res.json({
          message: "User Login Successful",
          status: true,
          access_token: grant.access_token.token,
          refresh_token: grant.refresh_token.token,
          user_id: grant.access_token.content.sub,
          role: grant.access_token.content?.realm_access?.roles,
        });
      })
      .catch((err) => {
        res.status(401).json({
          message: "Authentication failed",
          error: err,
          status: false,
          access_token: null,
          refresh_token: null,
          user_id: null,
        });
      });

  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "Wystąpił błąd serwera." });
  }
};

module.exports = { login };