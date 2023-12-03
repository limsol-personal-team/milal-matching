import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AUTH_REDIRECT } from "../../utils/constants";
import { checkSignInToken } from "../../utils/serverFunctions";

const CheckInAuthPage = () => {
  const { token: authToken } = useParams();
  const [errorStatus, setErrorStatus] = useState(false);
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate("/checkin", { state: { from: AUTH_REDIRECT } });
  };

  const validateToken = async (token: any) => {
    const res = await checkSignInToken(token);
    if (res.error) { 
      setErrorStatus(true);
    } else {
      handleRedirect();
    }
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
