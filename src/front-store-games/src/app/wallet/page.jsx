"use client";

import { useEffect, useContext } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from "next/navigation";
import UserContext from "../context/UserContext";
import { setUserData } from "../setUserContext";
import NavBar from "../NavBar";
import './style.scss';

export default function Wallet() {
  const { data: session, status } = useSession();
  const { user, setUser } = useContext(UserContext);
  const router = useRouter();

  const userName = user.username;
  const balance = user.walletBalance;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (Object.keys(user).length === 0) {
          await setUserData(setUser, session.access_token);
        }
      } catch (error) {
        console.error(error);
        router.push('/');
      }
    };

    if (status === 'authenticated' && session.access_token) {
      fetchData();
    } else if (status !== "loading") {
      router.push('/');
    }
  }, [status, session, user, setUser, router]);

  return (
    <>
      {user.username && <NavBar user={user} />}
      <main>
        <div className="walletMenu">
          <div className="info">
            <div className="balance">
              <h3>Stan konta: </h3>
              <h2>{balance} zł</h2>
            </div>
            <h3>Konto: {userName}</h3>
          </div>
          <div className="links">
            <a href="/history" className="history">Historia transakcji</a>
            <a href="/addbalance" className="addFunds">Dodaj środki na konto</a>
          </div>
        </div>
      </main>
    </>
  );
}
