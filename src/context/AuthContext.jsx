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
  const [accessRestriction, setAccessRestriction] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyAccessError = (error) => {
    const code = error.response?.data?.code;
    if (
      ![
        "ACCOUNT_REMOVED",
        "ACCESS_REQUEST_PENDING",
        "ACCESS_REQUEST_DENIED",
      ].includes(code)
    ) {
      return false;
    }

    setAccessToken(null);
    setUser(null);
    setAccessRestriction(code);
    return true;
  };

  useEffect(() => {
    let currentOperation = 0;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const operation = ++currentOperation;

      if (!firebaseUser) {
        setAuthToken(null);
        setAccessToken(null);
        setUser(null);
        setAccessRestriction(null);
        setLoading(false);
        return;
      }

      try {
        const idToken = await firebaseUser.getIdToken();
        if (operation !== currentOperation) return;

        setAuthToken(idToken);
        const response = await api.get("/profile");
        if (operation === currentOperation) {
          setAccessToken(idToken);
          setUser({ ...response.data.user, uid: firebaseUser.uid });
          setAccessRestriction(null);
        }
      } catch (error) {
        if (operation === currentOperation) {
          if (!applyAccessError(error)) {
            setAccessToken(null);
            setUser(null);
            console.error("Unable to synchronize the Firebase profile:", error);
          }
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
    try {
      const response = await api.get("/profile");
      setAccessToken(idToken);
      setUser({ ...response.data.user, uid: firebaseUser.uid });
      setAccessRestriction(null);
    } catch (error) {
      if (!applyAccessError(error)) throw error;
      throw error;
    }
  };

  const requestAccess = async () => {
    await api.post("/access-request");
    setAccessRestriction("ACCESS_REQUEST_PENDING");
  };

  const refreshAccess = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return false;

    const idToken = await firebaseUser.getIdToken();
    setAuthToken(idToken);
    try {
      const response = await api.get("/profile");
      setAccessToken(idToken);
      setUser({ ...response.data.user, uid: firebaseUser.uid });
      setAccessRestriction(null);
      return true;
    } catch (error) {
      if (applyAccessError(error)) return false;
      throw error;
    }
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
        accessRestriction,
        loginWithGoogle,
        requestAccess,
        refreshAccess,
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
