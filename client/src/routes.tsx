import * as React from "react";
import { Navigate, useRoutes } from "react-router-dom";
// layouts
import Dashboard from "./layout/Dashboard";
//
import CheckInPage from "./pages/CheckinPage";
import ErrorPage from "./pages/ErrorPage";
import HomePage from "./pages/HomePage";
import MatchingPage from "./pages/MatchingPage";

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      path: "/",
      element: <Dashboard />,
      children: [
        { element: <Navigate to="/home" />, index: true },
        { path: "home", element: <HomePage /> },
        { path: "matching", element: <MatchingPage /> },
        { path: "checkin", element: <CheckInPage /> },
        { path: "404", element: <ErrorPage /> },
      ],
    },
    {
      path: "*",
      element: <Navigate to="/404" />,
    },
  ]);

  return routes;
}
