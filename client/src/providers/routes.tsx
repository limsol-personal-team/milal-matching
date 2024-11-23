import * as React from "react";
import { Navigate, useRoutes } from "react-router-dom";
// layouts
import OpsDashboard from "../layout/OpsDashboard";
import Dashboard from "../layout/Dashboard";
// pages
import CheckInAuthPage from "../pages/public/CheckinAuthPage";
import CheckInPage from "../pages/public/CheckinPage";
import CheckInQRPage from "../pages/CheckinQRPage";
import ErrorPage from "../pages/ErrorPage";
import HomePage from "../pages/HomePage";
import MatchingPage from "../pages/MatchingPage";
import UserPage from "../pages/UserPage";
import HoursPage from "../pages/HoursPage";
import { Auth0Guard } from "../components/Auth0Guard";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import MilalFriendPage from "../pages/MilalFriendPage";
import DeveloperPage from "../pages/DeveloperPage";
import ContactPage from "../pages/ContactPage";

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      path: "/",
      element: <Dashboard />,
      children: [
        { element: <Navigate to="/ops" />, index: true },
        { path: "checkin", element: <CheckInPage /> },
        { path: "checkin-auth/:token", element: <CheckInAuthPage /> },
        { path: "404", element: <ErrorPage /> },
        { path: "401", element: <UnauthorizedPage /> },
      ],
    },
    {
      path: "/ops",
      element: <Auth0Guard component={OpsDashboard}/>,
      children: [
        { element: <Navigate to="/ops/home" />, index: true },
        { path: "/ops/home", element: <HomePage /> },
        { path: "/ops/volunteers", element: <UserPage /> },
        { path: "/ops/milal-friends", element: <MilalFriendPage /> },
        { path: "/ops/matching", element: <MatchingPage /> },
        { path: "/ops/volunteer-hours", element: <HoursPage /> },
        { path: "/ops/checkin-qr", element: <CheckInQRPage /> },
        { path: "/ops/developer", element: <DeveloperPage /> },
        { path: "/ops/contact", element: <ContactPage /> }
      ],
    },
    {
      path: "*",
      element: <Navigate to="/404" />,
    },
  ]);

  return routes;
}
