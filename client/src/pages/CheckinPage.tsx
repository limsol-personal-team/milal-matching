import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { GoogleLogin } from "@react-oauth/google";
import jwt_decode from "jwt-decode";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import SigninForm from "../components/SigninForm";
import { AUTH_REDIRECT } from "../utils/constants";

const CheckInPage = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [googleInfo, setGoogleInfo] = useState({});
  const [isAuthRedirect, setIsAuthRedirect] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const redirectPage = location.state && location.state.from;
    if (redirectPage == AUTH_REDIRECT) {
      setIsAuthRedirect(true);
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    document.body.appendChild(script);
  }, []);

  return (
    <>
      {isAuthRedirect ? (
        <Box sx={{ width: "100%" }}>
          <Box sx={{ my: 3, mx: 2 }}>
            <Grid container alignItems="center">
              <Grid item xs>
                <Typography gutterBottom variant="h4" component="div">
                  Check-in Page
                </Typography>
              </Grid>
            </Grid>
            <Typography color="text.secondary" variant="body2">
              Sign-in with google and submit a check-in.
            </Typography>
          </Box>
          <Divider variant="middle" />
          <Box sx={{ my: 3, mx: 2 }}>
            {isSignedIn ? (
              <SigninForm googleInfo={googleInfo} />
            ) : (
              <>
                <GoogleLogin
                  shape="pill"
                  onSuccess={(res) => {
                    setIsSignedIn(true);
                    setGoogleInfo(jwt_decode(res.credential!));
                  }}
                  onError={() => {
                    console.log("Login Failed");
                  }}
                />
              </>
            )}
          </Box>
        </Box>
      ) : (
        <Alert severity="error">
          Unauthorized access to check-in page. Please scan in via QR Code.
        </Alert>
      )}
    </>
  );
};

export default CheckInPage;
