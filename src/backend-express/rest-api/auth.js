const clearAllCookies = (res) => {
  res.clearCookie('username');
  res.clearCookie('walletBalance');
};

const verifyAuth = async (req, res) => {
  const user = req.cookies.username;
  const walletBalance = req.cookies.walletBalance;

  try {
    const grant = req.kauth.grant;
    const token_username = grant.access_token.content.preferred_username;

    if (!user || !walletBalance || user !== token_username) {
      clearAllCookies(res);
      return res.status(401).json({ error: "Brak autoryzacji." });
    }

    return true;
  } catch (err) {
    clearAllCookies(res);
    return res.status(401).json({ error: "Brak autoryzacji." });
  }
};

const checkRole = (role) => {
  return (req, res, next) => {
    const grant = req.kauth.grant;
    if (grant && grant.access_token && grant.access_token.hasRealmRole(role)) {
      return next();
    } else {
      res.status(403).send('Forbidden');
    }
  };
};


module.exports = { clearAllCookies, verifyAuth, checkRole };