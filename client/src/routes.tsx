import * as React from "react";
import { Navigate, useRoutes } from "react-router-dom";
// layouts
import OpsDashboard from "./layout/OpsDashboard";
import Dashboard from "./layout/Dashboard";
// pages
import CheckInAuthPage from "./pages/CheckinAuthPage";
import CheckInPage from "./pages/CheckinPage";
import CheckInQRPage from "./pages/CheckinQRPage";
import ErrorPage from "./pages/ErrorPage";
import HomePage from "./pages/HomePage";
import MatchingPage from "./pages/MatchingPage";
import UserPage from "./pages/UserPage";

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      path: "/",
      element: <Dashboard />,
      children: [
        { element: <Navigate to="/404" />, index: true },
        { path: "checkin", element: <CheckInPage /> },
        { path: "checkin-auth/:token", element: <CheckInAuthPage /> },
        { path: "404", element: <ErrorPage /> },
      ],
    },
    {
      path: "/ops/",
      element: <OpsDashboard />,
      children: [
        { element: <Navigate to="/ops/home" />, index: true },
        { path: "/ops/home", element: <HomePage /> },
        { path: "/ops/users", element: <UserPage /> },
        { path: "/ops/checkin-qr", element: <CheckInQRPage /> },
      ],
    },
    {
      path: "*",
      element: <Navigate to="/404" />,
    },
  ]);

  return routes;
}
