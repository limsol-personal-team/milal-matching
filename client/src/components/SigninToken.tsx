import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import React, { useEffect, useState } from "react";

const SigninToken = () => {

  const [token, setToken] =  useState("");
  const [isLoading, setIsLoading] =  useState(false);
  
  useEffect(() => {
    axios
      .get("/api/auth/sign_in_token/")
      .then((response) => {
        setToken(response.data.token)
      })
      .catch((error) => {
        console.error("Error submitting form:", error);
      });

  }, []);

  const handleSubmit = () => {
    setIsLoading(true);
    axios
      .post("/api/auth/sign_in_token/")
      .then((response) => {
        setToken(response.data.token)
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error submitting form:", error);
      });
  }

  return (
    <>
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