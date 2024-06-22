const extractToken = (req, res, next) => {
  const token = req.cookies['accessToken'];
  if (token) {
    req.headers['authorization'] = `Bearer ${token}`;
  }
  next();
};

module.exports = { extractToken };