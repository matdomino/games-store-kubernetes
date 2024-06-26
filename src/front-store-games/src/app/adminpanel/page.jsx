"use client";

import { useEffect, useContext, useState } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from "next/navigation";
import UserContext from "../context/UserContext";
import { setUserData } from "../setUserContext";
import NavBar from "../NavBar";
import './style.scss';
import axios from "@/api/axios";

const ADD_GAME = "/addgame";

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const { user, setUser } = useContext(UserContext);
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'authenticated' && session.access_token && session.roles.includes('employee')) {
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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    if (file && file.type !== 'application/json') {
      setError("Nieprawidłowy format pliku JSON.");
    } else {
      setError(null);
    }
  };

  const handleSubmit = async (accessToken) => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const res = await axios.post(
          ADD_GAME,
          formData,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${accessToken}`
            }
          });
        if (res.status === 200) {
          alert("Dodano grę do bazy!");
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
    }
  };

  return (
    <>
      <div>
        {user.username && <NavBar user={user} />}
      </div>
      <div className="addGameMenuContainer">
        <div className="addGameMenu">
          <h2>Dodaj grę:</h2>
          <input type="file" accept=".json" onChange={handleFileChange} />
          {error && <p className="error">{error}</p>}
          <button onClick={() => handleSubmit(session.access_token)}>Dodaj grę</button>
        </div>
      </div>
    </>
  );
}
