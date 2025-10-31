import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const user = authService.getStoredUser();
          if (user) {
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: { user },
            });
          } else {
            // Token exists but no user data, try to fetch user
            const currentUser = await authService.getCurrentUser();
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: { user: currentUser },
            });
          }
        } catch (error) {
          // Invalid token, clear it
          authService.logout();
          dispatch({
            type: AUTH_ACTIONS.LOGIN_FAILURE,
            payload: 'Session expired. Please login again.',
          });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initAuth();
  }, []);

  // Login with Google
  const login = async (code) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      
      const data = await authService.handleGoogleCallback(code);
      
      // Store token and user data
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: data.user },
      });
      
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};