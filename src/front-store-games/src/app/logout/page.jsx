"use client";

import { useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from 'next-auth/react';
import UserContext from "../context/UserContext";
import axios from "@/api/axios";

const LOGOUT_URL = '/deletecookies';
const KEYCLOAK_LOGOUT_URL = 'http://localhost:8080/realms/games-store/protocol/openid-connect/logout';


export default function Logout() {
  const { data: session } = useSession();
  const { setUser } = useContext(UserContext);
  const router = useRouter();

  const logout = async () => {
    try {
      const res = await axios.delete(LOGOUT_URL, { withCredentials: true });
      if (res.data.status) {
        setUser({});

        await signOut({ redirect: false, callbackUrl: '/' });

        if (session) {
          window.location.href = KEYCLOAK_LOGOUT_URL;
        }
      } else {
        alert('Wystąpił błąd podczas przetwarzania żądania.');
      }
    } catch (err) {
      console.log(err);
      alert('Brak odpowiedzi serwera. Skontaktuj się z administratorem.');
    }
  };


  useEffect(() => {
    const handleLogout = async () => {
      await logout();
    };

    handleLogout();
  }, [session]);
}