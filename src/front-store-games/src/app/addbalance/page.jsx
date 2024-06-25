"use client";

import { useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { useSession } from 'next-auth/react';
import UserContext from "../context/UserContext";
import { setUserData } from "../setUserContext";
import NavBar from "../NavBar";
import AddBalance from "./AddBalance";
import './style.scss';

export default function Balance() {
  const { data: session, status } = useSession();
  const { user, setUser } = useContext(UserContext);
  const router = useRouter();

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

  if (status === 'loading' || !session || !session.access_token) {
    return;
  }

  return(
    <>
      {user.username && <NavBar user={user} />}
      <main>
        <AddBalance accessToken={session.access_token} />
      </main>
    </>
  );
}