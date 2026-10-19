import { useState, useEffect } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import api, { setAuthToken } from "../api/axios";
import { auth } from "../firebase";
import { AuthContext } from "./AuthContext.js";

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let currentOperation = 0;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const operation = ++currentOperation;

      if (!firebaseUser) {
        setAuthToken(null);
        setAccessToken(null);
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const idToken = await firebaseUser.getIdToken();
        if (operation !== currentOperation) return;

        setAuthToken(idToken);
        setAccessToken(idToken);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || "",
          fullName: firebaseUser.displayName || "",
          username: "",
        });

        const response = await api.get("/profile");
        if (operation === currentOperation) {
          setUser({ ...response.data.user, uid: firebaseUser.uid });
        }
      } catch (error) {
        if (operation === currentOperation) {
          console.error("Unable to synchronize the Firebase profile:", error);
        }
      } finally {
        if (operation === currentOperation) setLoading(false);
      }
    });

    return () => {
      currentOperation += 1;
      unsubscribe();
      setAuthToken(null);
    };
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const { user: firebaseUser } = await signInWithPopup(auth, provider);
    const idToken = await firebaseUser.getIdToken();
    setAuthToken(idToken);
    setAccessToken(idToken);
    const response = await api.get("/profile");
    setUser({ ...response.data.user, uid: firebaseUser.uid });
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (username, fullName) => {
    const response = await api.put("/profile", { username, fullName });
    setUser((currentUser) => ({
      ...currentUser,
      ...response.data.user,
    }));
    return response.data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        token: accessToken,
        user,
        setUser,
        loginWithGoogle,
        logout,
        updateProfile,
        isAuthenticated: Boolean(accessToken),
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
