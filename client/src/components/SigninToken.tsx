import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import React, { useEffect, useState } from "react";
import AlertToaster from "./AlertToaster";
import { getSignInToken, postSignInToken } from "../utils/serverFunctions";
import { useAuth0 } from "@auth0/auth0-react";

const SigninToken = () => {
  const { getAccessTokenSilently } = useAuth0();
  
  // Alerting
  const [errorStatus, setErrorStatus] = useState(false);
  const alertProps = { errorStatus, setErrorStatus}

  const [token, setToken] =  useState("");
  const [isLoading, setIsLoading] =  useState(false);
  
  useEffect( () => {
    const fetchData = async () => {
      const authToken = await getAccessTokenSilently();
      const res = await getSignInToken(authToken);
      if (res.error) {
        console.error(res.error);
      } else {
        setToken(res.data.token);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    const authToken = await getAccessTokenSilently();
    const res = await postSignInToken(authToken);
    if (res.error) {
      setErrorStatus(true);
      setIsLoading(false);
    } else {
      setToken(res.data.token)
      setIsLoading(false);
    }
  }

  return (
    <>
      <AlertToaster {...alertProps}/>
      <Button
          variant="contained"
          size="medium"
          onClick={() => {
            handleSubmit();
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Generate Token"
          )}
      </Button>
      <br></br>
      <br></br>
      <Typography>
        Token: {token ? "****" + token.slice(-4) : "None"}
      </Typography>
    </>
  );

}

export default SigninToken;