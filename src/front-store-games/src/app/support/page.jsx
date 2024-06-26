"use client";

import { useEffect, useState, useContext } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from "next/navigation";
import UserContext from "../context/UserContext";
import { setUserData } from "../setUserContext";
import NavBar from "../NavBar";
import axios from "@/api/axios";
import './style.scss';

const GET_SUPPORT_MSGS = '/getsupportmsgs';

export default function Support() {
  const { data: session, status } = useSession();
  const { user, setUser } = useContext(UserContext);
  const [ pending, setPending ] = useState([]);
  const [ closed, setClosed ] = useState([]);
  const router = useRouter();

  useEffect( () => {
    const fetchData = async (accessToken) => {
      try {
        const msgs = await axios.get(
          GET_SUPPORT_MSGS,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });

        if (msgs.status === 200) {
          setClosed(msgs.data.closed);
          setPending(msgs.data.peding);
        } else {
          alert('Wystąpił błąd podczas przetwarzania żądania.');
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

    if (status === 'authenticated' && session.access_token) {
      fetchData(session.access_token);
    } else if (status !== "loading") {
      router.push('/');
    }
  }, [status, session, user, setUser, router]);

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
  }, [pending, closed]);

  const sendMsg = () => {
    router.push('/sendsupportmsg');
  };

  return (
    <>
      <div>
        {user.username && <NavBar user={user} />}
      </div>
      <main>
        <div className="msgs">
          <div className="menu">
            <div className="pending">
              <h2>Otwarte zapytania:</h2>
              <ul>
                {pending.map((elem, index) => (
                  <li key={index}>
                    <h3>Temat: {elem.topic}</h3>
                    <h4>ID: {elem._id}</h4>
                    <div>Data: {new Date(elem.date).toLocaleString()}</div>
                    <div>Wiadomosc: {elem.msg}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="closed">
            <h2>Zamknięte zapytania:</h2>
              <ul>
                {closed.map((elem, index) => (
                  <li key={index}>
                    <h3>Temat: {elem.topic}</h3>
                    <h4>ID: {elem._id}</h4>
                    <div>Data: {new Date(elem.date).toLocaleString()}</div>
                    <div>Wiadomosc: {elem.msg}</div>
                    <div>Odpowiedz: {elem.response}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="send">
            <button onClick={sendMsg}>Wyślij zapytanie</button>
          </div>
        </div>
      </main>
    </>
  );
}
