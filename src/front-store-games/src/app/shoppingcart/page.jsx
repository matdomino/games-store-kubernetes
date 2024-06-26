"use client";

import { useEffect, useContext, useState } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from "next/navigation";
import UserContext from "../context/UserContext";
import { setUserData } from "../setUserContext";
import axios from "@/api/axios";
import NavBar from "../NavBar";
import './style.scss';

const CHECKOUT_URL = '/checkout';
const FINALIZE_URL = '/finalizeorder';

export default function ShoppingCart() {
  const { data: session, status } = useSession();
  const { user, setUser } = useContext(UserContext);
  const [ reload, setReload ] = useState(false);
  const [ checkoutData, setCheckoutData ] = useState(null);
  const router = useRouter();

  const getChekout = async (accessToken) => {
    try {
      const res = await axios.get(
        CHECKOUT_URL,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

      if (res.status === 200) {
        setCheckoutData(res.data);
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

      getChekout(session.access_token);
    } else if (status !== "loading") {
      router.push('/');
    }
  }, [status, session, user, setUser, router, reload]);

  const finalizeOrder = async (accessToken) => {
    try {
      const res = await axios.post(
        FINALIZE_URL,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

      if (res.status === 200) {
        alert('Twoje zamówienie zostało zrealizowane!');
        await setUserData(setUser, accessToken);
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

  const deleteFromCart = async (gameId, accessToken) => {
    try {
      const DELETE_URL = `/deletefromcart/${gameId}`;
      const res = await axios.delete(
        DELETE_URL,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

      if (res.status === 200) {
        alert("Usunięto pozycje z koszyka");
        setReload(!reload);
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

  const Cart = ({checkoutData, accessToken}) => {
    return(
      <div className="cart-box">
        <h1>Koszyk:</h1>
        <div className="cart">
            <div className="gameslist">
              <h2>Gry:</h2>
              <div className="prices">
                <ul>
                  {checkoutData.shoppingCart.map((elem, index) => (
                    <li key={index}>
                      <div className="game">
                        <div className="name">
                          <span>{elem.name}</span>
                        </div>
                        <div className="options">
                          <span>{elem.price} zł</span>
                          <button onClick={() => deleteFromCart(elem._id, accessToken)}>Usuń</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <h2>Razem: {checkoutData.total} zł</h2>
              </div>
            </div>
            <div className="address-and-button">
              <div className="address">
                <h2>Adres:</h2>
                <ul>
                  <li>{checkoutData.address.firstName} {checkoutData.address.lastName}</li>
                  <li>Miasto: {checkoutData.address.city}</li>
                  <li>Ulica: {checkoutData.address.street}</li>
                  <li>Nr domu: {checkoutData.address.home}</li>
                  <li>Nr mieszkania: {checkoutData.address.flat}</li>
                  <li>Kod pocztowy: {checkoutData.address.postCode}</li>
                </ul>
              </div>
              <div className="button-box">
                <button onClick={() => finalizeOrder(accessToken)}>Kup gry</button>
              </div>
            </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {user.username && <NavBar user={user} />}
      <main>
        { checkoutData ? <Cart checkoutData={checkoutData} accessToken={session.access_token} /> : null }
      </main>
    </>

  );
}
