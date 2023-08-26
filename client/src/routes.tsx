import * as React from "react";
import { Navigate, useRoutes } from "react-router-dom";
// layouts
import Dashboard from "./layout/Dashboard";
// pages
import CheckInAuthPage from "./pages/CheckinAuthPage";
import CheckInPage from "./pages/CheckinPage";
import CheckInQRPage from "./pages/CheckinQRPage";
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
        { path: "checkin-qr", element: <CheckInQRPage /> },
        { path: "checkin-auth/:token", element: <CheckInAuthPage /> },
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
