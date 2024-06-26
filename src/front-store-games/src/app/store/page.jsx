"use client";

import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { useSession } from 'next-auth/react';
import UserContext from "../context/UserContext";
import { setUserData } from "../setUserContext";
import NavBar from "../NavBar";
import axios from "@/api/axios";
import cookie from 'js-cookie';
import './style.scss';
import FilterForm from "./FilterForm";


const GAMES_URL = '/storegames';

const removeAllCookies = () => {
  const allCookies = cookie.get();
  for (const cookieName in allCookies) {
    cookie.remove(cookieName);
  }
};

export default function Store() {
  const { data: session, status } = useSession();
  const { user, setUser } = useContext(UserContext);
  const [ games, setGames ] = useState([]);
  const router = useRouter();

  const getGames = async (body, access_token) => {
    try {
      const res = await axios.post(
        GAMES_URL,
        body,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        });
      if (res.data.status === "success") {
        setGames(res.data.games);
      } else {
        router.push('/');
        alert('Wystąpił błąd podczas przetwarzania żądania.');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        if (err.response.status === 401 || err.response.status === 403) {
          alert(err.response.data);
          removeAllCookies();
          router.push('/');
        }
      } else {
        alert('Brak odpowiedzi serwera. Skontaktuj się z administratorem.');
      }
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session.access_token) {
      if (Object.keys(user).length === 0) {
        const isLoggedIn = setUserData(setUser, session.access_token);
        if (!isLoggedIn) {
          router.push('/');
        }
      }

      const initialSearchBody = {
        sortBy: "name",
        sortOrder: "asc"
      };

      getGames(initialSearchBody, session.access_token);
    } else if (status !== "loading") {
      router.push('/');
    }
  }, [status, session, user, setUser, router]);

  const redirectToGame = (gameId) => {
    router.push(`/game/${gameId}`);
  };

  const GamesList = ({ games }) => {
    return(
      <ul>
        {games.map((elem, index) => (
          <li key={index} onClick={() => redirectToGame(elem._id)}>
            <div>
              <h3>{elem.name}</h3>
              <img src={elem.mainPhoto} alt="Zdjęcie" />
              <div className="price">Cena: {elem.price} zł</div>
              <div className="avgGrade">Średnia ocen: {elem.averageGrade}</div>
              <ul>
                {elem.genres.map((elem, index) => (
                  <span key={index}>{elem}</span>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      {user.username && <NavBar user={user} />}
      <main>
        <div className="gamesListClass">
          <div className="options">
            { games.length > 0 ? <FilterForm className="FilterForm" setGames={setGames} accessToken={session.access_token} /> : null }
          </div>
          <div className="games">
            { games.length > 0 ? <GamesList games={games} /> : null }
          </div>
        </div>
      </main>
    </div>
  );
}
