"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from 'next-auth/react';
import cookie from 'js-cookie';
import axios from "@/api/axios";

const COOKIES_URL = '/setcookies';

const logout = async() => {
  await signOut({ redirect: false, callbackUrl: '/' });
};

const removeAllCookies = () => {
  const allCookies = cookie.get();
  for (const cookieName in allCookies) {
    cookie.remove(cookieName);
  }
};

const fetchCookies = async (router, accessToken) => {
  try {
    const res = await axios.post(
      COOKIES_URL,
      {},
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (res.status === 200) {
      router.push('/store');
    }
  } catch (err) {
    if (err.response && err.response.data.error) {
      alert(err.response.data.error);
    } else if (err.response && err.response.status === 403) {
      removeAllCookies();
      logout();
    } else {
      alert('Brak odpowiedzi serwera. Skontaktuj się z administratorem.');
    }
  }
};

export default function App() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userName = cookie.get('username');
  const walletBalance = cookie.get('walletBalance');

  useEffect(() => {

    if (status === "loading") {
      return;
    }

    if (status === "authenticated") {

      if (userName && walletBalance) {
        router.push('/store');
      } else {
        fetchCookies(router, session.access_token);
      }
    } else {
      signIn('keycloak');
    }
  }, [status, userName, walletBalance, router]);
}
