"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from 'next-auth/react';
import cookie from 'js-cookie';
import axios from "@/api/axios";

const COOKIES_URL = '/setcookies';

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
        console.log("test2");
        fetchCookies(router, session.access_token);
      }
    } else {
      console.log("test3");
      signIn('keycloak');
    }
  }, [status, userName, walletBalance, router]);
}
