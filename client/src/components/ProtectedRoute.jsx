//Dana


// ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

export default function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    let isMounted = true; // avoid setting state on unmounted component
    const checkAuth = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5001/api/auth/is-auth",
          { withCredentials: true }
        );
        if (isMounted) setIsAuth(data.success === true);
      } catch (error) {
        if (isMounted) setIsAuth(false);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    checkAuth();
    return () => { isMounted = false; };
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // could also show a spinner
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
