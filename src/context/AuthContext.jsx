import { useState, useEffect } from 'react';
import api, { setAuthToken } from '../api/axios';
import { AuthContext } from './AuthContext.js';

// This file exports ONLY the AuthProvider component
export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessTokenState] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    const setAccessToken = (token) => {
        setAccessTokenState(token);
        setAuthToken(token);
    };

    // Restore session
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const response = await api.post('/refresh');

                setAccessToken(response.data.accessToken);

                if (response.data.Users) {
                    setUser(response.data.Users);
                }
            } catch {
                setAccessToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    // SIGNUP
    const signup = async (
        username, email, mobile, password, confirmPassword
    ) => {
        const response = await api.post('/signup', {
            username, email, mobile, password, confirmPassword
        });

        setAccessToken(response.data.accessToken);
        setUser(response.data.newUsers);
    };

    // LOGIN
    const login = async (identifier, password) => {
        const response = await api.post('/login', {
            identifier,
            password
        });

        setAccessToken(response.data.accessToken);
        setUser(response.data.Users);
    };

    // LOGOUT
    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            setAccessToken(null);
            setUser(null);
        }
    };

    // UPDATE PROFILE
    const updateProfile = async (name) => {
        const response = await api.put('/profile', { name });

        setUser(response.data.Users);

        return response.data.Users;
    };

    if (loading) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--color-bg)',
                }}
            >
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        border: '3px solid var(--color-border)',
                        borderTopColor: 'var(--color-accent)',
                    }}
                    className="animate-spin"
                />
            </div>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                accessToken,
                token: accessToken,
                user,
                setUser,
                signup,
                login,
                logout,
                updateProfile,
                isAuthenticated: !!accessToken
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};