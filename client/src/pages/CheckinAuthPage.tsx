import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AUTH_REDIRECT } from "../utils/constants";

const CheckInAuthPage = () => {
  const { token: authToken } = useParams();
  const [errorStatus, setErrorStatus] = useState(false);
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate("/checkin", { state: { from: AUTH_REDIRECT } });
  };

  const validateToken = (token: any) => {
    const url = "http://localhost:8000/auth/sign_in_check?token=" + token;
    axios
      .get(url)
      .then(() => {
        handleRedirect();
      })
      .catch((error) => {
        setErrorStatus(true);
      });
  };

  useEffect(() => {
    validateToken(authToken);
  }, []);

  return (
    <>
      {errorStatus ? (
        <Alert severity="error">
          Failed QR Auth. Please contact site admin for help.
        </Alert>
      ) : (
        <Stack alignItems="center">
          <CircularProgress />
        </Stack>
      )}
    </>
  );
};

export default CheckInAuthPage;
