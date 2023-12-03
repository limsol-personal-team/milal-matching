import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import QRCode from "qrcode.react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertToaster from "./AlertToaster";
import { getSignInToken } from "../utils/serverFunctions";
import { useAuth0 } from "@auth0/auth0-react";

const SigninQRCode = () => {
  const { getAccessTokenSilently } = useAuth0();
  const checkinAuthPath = window.location.origin + "/checkin-auth/";
  const [qrCodeData, setQRCodeData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Alerting
  const [errorStatus, setErrorStatus] = useState(false);
  const alertProps = { errorStatus, setErrorStatus}

  const handleSubmit = async () => {
    setIsLoading(true);
    const authToken = await getAccessTokenSilently();
    const res = await getSignInToken(authToken);
    if (res.error) {
      setErrorStatus(true);
      setIsLoading(false);
    } else {
      const token = res.data.token;
      setIsLoading(false);
      if (!token) {
        setErrorStatus(true);
        return;
      }
      setQRCodeData(token);
    }
  };

  const handleQRCodeClick = () => {
    navigate("/checkin-auth/" + qrCodeData);
  };


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
          "Generate QR"
        )}
      </Button>
      <br></br>
      <br></br>
      {qrCodeData &&
        <QRCode
          size={300}
          onClick={handleQRCodeClick}
          value={checkinAuthPath + qrCodeData}
        />
      }
    </>
  );
};

export default SigninQRCode;
