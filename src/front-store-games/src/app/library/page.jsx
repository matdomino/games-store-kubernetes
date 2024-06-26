"use client";

import { useEffect, useContext, useState, useRef } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from "next/navigation";
import UserContext from "../context/UserContext";
import { setUserData } from "../setUserContext";
import NavBar from "../NavBar";
import axios from "@/api/axios";
import ReviewGame from "./reviewGame";
import "./style.scss";

const GAMES_LIBRARY = '/getownedgames';
const ADD_FAV = '/addtofavourites';

export default function Library() {
  const { data: session, status } = useSession();
  const { user, setUser } = useContext(UserContext);
  const router = useRouter();
  const [ games, setGames ] = useState([]);
  const [ selectedDetails, setSelectedDetails ] = useState(null);
  const [ refresh, setRefresh ] = useState(false);
  const [ favGames, setFavGames ] = useState([]);
  const [ type, setType ] = useState(null);
  const selectedRef = useRef(null);

  const getLibrary = async (accessToken) => {
    try {
      const res = await axios.get(
        GAMES_LIBRARY,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

      if (res.status === 200) {
        setGames(res.data.games);
        setFavGames(res.data.favouriteGames);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        if (err.response.status === 401 || err.response.status === 403) {
          alert(err.response.data);
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

      getLibrary(session.access_token);
    } else if (status !== "loading") {
      router.push('/');
    }
  }, [refresh, status, session, user, setUser, router]);

  const getGamesDetails = async (elemId, accessToken) => {
    const GAME_URL = `/gamedetails/${elemId}`;

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
        setSelectedDetails(res.data.game);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        if (err.response.status === 401 || err.response.status === 403) {
          alert(err.response.data);
          router.push('/');
        }
      } else {
        alert('Brak odpowiedzi serwera. Skontaktuj się z administratorem.');
      }
    }
  };

  const handleClickFavourite = async (elemId, accessToken) => {
    selectedRef.current = elemId;
    await getGamesDetails(elemId, accessToken);
    setType("fav");
  };

  const handleClick = async (elemId, accessToken) => {
    selectedRef.current = elemId;
    await getGamesDetails(elemId, accessToken);
    setType("normal");
  };

  const GamesList = ({ games, favGames, accessToken }) => {
    return(
      <div className="gamesList">
        <h3>Ulubione:</h3>
        <ul className="favourite">
          {favGames.map((elem, index) => (
            <li key={index} onClick={() => handleClickFavourite(elem.id, accessToken)}>
              {elem.name}
            </li>
          ))}
        </ul>
        <h3>Wszystkie gry:</h3>
        <ul className="games">
          {games.map((elem, index) => (
            !favGames.some(favGame => favGame.id === elem.id) && (
              <li key={index} onClick={() => handleClick(elem.id, accessToken)}>
                {elem.name}
              </li>
            )
          ))}
        </ul>
      </div>
    );
  };

  const addTofav = async (accessToken) => {
    try {
      const data = {
        gameId: selectedRef.current
      };
      const res = await axios.post(ADD_FAV,
        data,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

      if (res.status === 200) {
        if (type === "fav") {
          setType("normal");
        }
        if (type === "normal") {
          setType("fav");
        }
        setRefresh(!refresh);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        if (err.response.status === 401 || err.response.status === 403) {
          alert(err.response.data);
          router.push('/');
        }
      } else {
        alert('Brak odpowiedzi serwera. Skontaktuj się z administratorem.');
      }
    }
  };

  const redirectToReturn = () => {
    router.push(`/returngame/${selectedRef.current}`);
  };

  const GamesOptions = ({type, accessToken}) => {
    return(
      <div className="GameDetails">
        <img src={selectedDetails.mainPhoto} alt="" />
        <div className="navBar">
          <button className="fav" onClick={() => addTofav(session.access_token)}>{type === "normal" ? "Dodaj do ulubionych" : "Usuń z ulubionych"}</button>
        </div>
        <div className="options">
          <div className="review">
            <ReviewGame elemId={selectedRef.current} accessToken={accessToken} />
          </div>
        </div>
        <div className="returnUrl">
            <a href="#" onClick={redirectToReturn}>Nie podoba Ci się gra? Zwróć ją tutaj.</a>
          </div>
      </div>
    );
  };

  const ShowNonePrompt = () => {
    return(
      <div className="nonePrompt">
        Wybierz grę aby zobaczyć opcje
      </div>
    );
  };

  if (status === 'loading') {
    return;
  }

  return (
    <div>
      {user.username && <NavBar user={user} />}
      <main>
        <div className="gamesMenu">
          <GamesList games={games} favGames={favGames} accessToken={session.access_token} />
          <div className="optionDiv">
            {type ? <GamesOptions gameId={selectedRef.current} type={type} accessToken={session.access_token}/> : <ShowNonePrompt />}
          </div>
        </div>
      </main>
    </div>
  );
}