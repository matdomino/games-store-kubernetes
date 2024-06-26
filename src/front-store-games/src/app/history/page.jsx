"use client";

import { useEffect, useContext, useState } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from "next/navigation";
import axios from "@/api/axios";
import UserContext from "../context/UserContext";
import { setUserData } from "../setUserContext";
import NavBar from "../NavBar";
import './style.scss';
import {FundsAdd, OrderFinalization, Return} from "./details";

const HISTORY_URL = '/gettransactionshistory';

export default function Notifications() {
  const { data: session, status } = useSession();
  const { user, setUser } = useContext(UserContext);
  const [ history, setHistory ] = useState(null);
  const [ selectedId, setSelectedId ] = useState(null);
  const [ selectedDetails, setSelectedDetails ] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async (accessToken) => {
      try {
        if (Object.keys(user).length === 0) {
          await setUserData(setUser, accessToken);
        }
      } catch (error) {
        console.error(error);
        router.push('/');
      }
    };

    if (status === 'authenticated' && session.access_token) {
      fetchData(session.access_token);
    } else if (status !== "loading") {
      router.push('/');
    }
  }, [status, session, user, setUser, router]);

  const getHistoryList = async (accessToken) => {
    try {
      const res = await axios.get(
        HISTORY_URL,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
      if (res.status === 200) {
        setHistory(res.data.transactions);
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
      getHistoryList(session.access_token);
    } else if (status !== "loading") {
      router.push('/');
    }
  }, [status, session, user, setUser, router]);

  const FetchTransactionDetails = async (elem, accessToken) => {
    const TRANSACTION_DETAILS_URL = `/gettransactiondetails/${elem}`;
    try {
      const res = await axios.get(
        TRANSACTION_DETAILS_URL,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

      if (res.status === 200) {
        setSelectedId(elem);
        setSelectedDetails(res.data);
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

  const TransactionDetails = ({details}) => {
    if (details.type === "Funds add to balance") {
      return(
        <FundsAdd details={details}/>
      );
    } else if (details.type === "Order finalization") {
      return(
        <OrderFinalization details={details}/>
      );
    } else {
      return(
        <Return details={details}/>
      );
    }
  };

  const HistoryList = ({history}) => {
    return (
      <div className="historyList">
        <h1>Historia transakcji:</h1>
        <ul>
          {history.map((elem, index) => {
            return(
              <li key={index} id={elem} onClick={() => FetchTransactionDetails(elem, session.access_token)}>
                ID: {elem} {selectedId === elem ? "▴" : "▾"}
                {selectedId === elem ? <TransactionDetails details={selectedDetails} /> : null}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <>
      {user.username && <NavBar user={user} />}
      <main>
        {history !== null ? (history.length > 0 ? <HistoryList history={history}/> : null) : null}
      </main>
    </>
  );
}
