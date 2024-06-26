"use client";

import { useEffect, useContext, useState } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from "next/navigation";
import UserContext from "../../context/UserContext";
import { setUserData } from "../../setUserContext";
import NavBar from "../../NavBar";
import ReturnGameModule from "./returnGame";
import './style.scss';
import axios from "@/api/axios";

export default function ReturnGame({ params }) {
  const { data: session, status } = useSession();
  const GAME_URL = `/gamedetails/${params.game}`;

  const { user, setUser } = useContext(UserContext);
  const [ game, setGame ] = useState(null);
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

  useEffect(() => {
    const dataFetch = async (accessToken) => {
      try {
        const res = await axios.get(
          GAME_URL,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });

        if (res.data.status === "success") {
          setGame(res.data.game);
        }
      } catch (err) {
        console.error(err);
        if (err.message.includes('Network Error')) {
          alert('Brak odpowiedzi serwera. Skontaktuj się z administratorem.');
        } else if (err.response.status === 500) {
          setGame("NotFound");
        } else if (err.response.status === 404) {
          setGame("NotFound");
        } else {
          router.push('/');
        }
      }
    };

    if (status === 'authenticated' && session.access_token) {
      dataFetch(session.access_token);
    } else if (status !== "loading") {
      router.push('/');
    }

  }, [status, session, user, setUser, router]);

  const NotFound = () => {
    return(
      <div>
        404: Nie znaleziono podanej gry
      </div>
    );
  };

  const goBack = () => {
    router.push('/library');
  };

  if (status === 'loading') {
    return;
  }

  return (
    <main>
      {user.username && <NavBar user={user} />}
      <div className="return">
        <button className="backButton" onClick={goBack}>←</button>
        <div className="returnForm">
          { game === null ? null : game === "NotFound" ? <NotFound /> : <ReturnGameModule elemId={params.game} gameName={game.name} accessToken={session.access_token}/>}
        </div>
      </div>
    </main>
  );
}
