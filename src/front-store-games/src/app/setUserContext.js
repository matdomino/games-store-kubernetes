import cookie from 'js-cookie';
import axios from '@/api/axios';

const WALLET_BALANCE_URL = '/walletbalance';

export const setUserData = async (setUser, accessToken) => {
  const res = await axios.get(
    WALLET_BALANCE_URL,
    {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (res.status === 200) {
    cookie.set('walletBalance', res.data.balance, { expires: 1 });
  } else {
    setUser({});
  }

  const userName = cookie.get('username');
  const walletBalance = cookie.get('walletBalance');

  if (userName && walletBalance) {
    setUser({ username: userName, walletBalance: walletBalance });

    return true;
  } else {
    return false;
  }
};
