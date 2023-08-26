import { GoogleOAuthProvider } from "@react-oauth/google";
import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import Router from "./routes";

export default function App() {
  const googleClientId =
    "371454562307-cc12pbhtkc4r9ehjsocchckqpus9ggct.apps.googleusercontent.com";
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
