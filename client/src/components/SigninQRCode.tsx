import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import axios from "axios";
import QRCode from "qrcode.react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertToaster from "./AlertToaster";

const SigninQRCode = () => {
  const checkinAuthPath = window.location.origin + "/checkin-auth/";
  const [qrCodeData, setQRCodeData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Alerting
  const [errorStatus, setErrorStatus] = useState(false);
  const alertProps = { errorStatus, setErrorStatus}

  const handleSubmit = async () => {
    setIsLoading(true);
    axios
      .get("/api/auth/sign_in_token")
      .then((response) => {
        const token = response.data.token;
        setIsLoading(false);
        if (!token) {
          setErrorStatus(true);
          return;
        }
        setQRCodeData(token);
      })
      .catch((error) => {
        setErrorStatus(true);
        setIsLoading(false);
      })
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
