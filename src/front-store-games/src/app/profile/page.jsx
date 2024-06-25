"use client";

import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { useSession } from 'next-auth/react';
import UserContext from "../context/UserContext";
import { setUserData } from "../setUserContext";
import NavBar from "../NavBar";
import './style.scss';
import axios from "@/api/axios";
import AddressChange from "./AddressChange";

const USER_DATA_URL = "/getuserdata";

export default function Profile() {
  const { data: session, status } = useSession();
  const { user, setUser } = useContext(UserContext);
  const [ userInfo, setUserInfo ] = useState({});
  const [ component, setComponent ] = useState("UserInfoComponent");
  const router = useRouter();

  useEffect(() => {
    const dataFetch = async (accessToken) => {
      try {
        const res = await axios.get(
          USER_DATA_URL,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });

        if (res.data.status === "success") {
          setUserInfo(res.data.data);
        }
      } catch (err) {
        console.error(err);
        if (err.message.includes('Network Error')) {
          alert('Brak odpowiedzi serwera. Skontaktuj się z administratorem.');
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

  useEffect(() => {
    if (status === 'authenticated' && session.access_token) {
      if (Object.keys(user).length === 0) {
        const isLoggedIn = setUserData(setUser, session.access_token);
        if (!isLoggedIn) {
          router.push('/');
        }
      }
    } else if (status !== "loading") {
      router.push('/');
    }
  }, [status, session, user, setUser, router]);

  useEffect(() => {
  }, [component]);

  const toggleToAddressChange = () => {
    setComponent("AddressChange");
  };

  const toggleToUserInfoComponent = () => {
    setComponent('UserInfoComponent');
  };

  const UserInfoComponent = ({ user }) => {
    return(
      <div className="info">
        <h3>Dane:</h3>
        <div className="generalInfo">
          <h4>Email:</h4>
          <div className="email">
            <span>{session.user.email}</span>
            <button onClick={() => window.location.href = 'http://localhost:8080/realms/games-store/account/'}>Zmień</button>
          </div>
          <h4>Nazwa użytkownika:</h4>
          <div className="username">
            <span>{user.username}</span>
          </div>
        </div>
        <div className="Address">
          <div className="addressInfo">
            <h4>Adres: </h4>
            <span>Imię: {user.address.firstName}</span>
            <span>Nazwisko: {user.address.lastName}</span>
            <span>Miasto: {user.address.city}</span>
            <span>Ulica: {user.address.street}</span>
            <span>Nr domu: {user.address.home}</span>
            <span>Nr mieszkania: {user.address.flat}</span>
            <span>Kod pocztowy: {user.address.postCode}</span>
            <button onClick={toggleToAddressChange}>Zmień</button>
          </div>
        </div>
        <div className="pass">
          <button onClick={() => window.location.href = 'http://localhost:8080/realms/games-store/account/account-security/signing-in'}>Zmień hasło</button>
        </div>
      </div>
    );
  };

  const renderComponent = () => {
    switch (component) {
      case "AddressChange":
        return <AddressChange backFun={toggleToUserInfoComponent} />;
      default:
        return <UserInfoComponent user={userInfo} />;
    }
  };

  return (
    <>
      {user.username && <NavBar user={user} />}
      <main>
        {Object.keys(userInfo).length > 0 && renderComponent()}
      </main>
    </>
  );
}
