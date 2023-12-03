import { GoogleOAuthProvider } from "@react-oauth/google";
import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import Router from "./providers/routes";
import { Auth0ProviderWithNavigate } from "./providers/auth0Provider";

export default function App() {
  const googleClientId =
    "371454562307-cc12pbhtkc4r9ehjsocchckqpus9ggct.apps.googleusercontent.com";
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <Auth0ProviderWithNavigate>
          <Router />
        </Auth0ProviderWithNavigate>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
