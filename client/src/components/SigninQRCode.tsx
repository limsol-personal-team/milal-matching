import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import axios from "axios";
import QRCode from "qrcode.react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SigninQRCode = () => {
  const basePath = "http://localhost:3000/checkin-auth/";
  const [qrCodeData, setQRCodeData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/auth/sign_in_token/");
      const token = response.data.token;
      setQRCodeData(token);
    } catch (error) {
      setErrorStatus(true);
    }
  };

  const handleQRCodeClick = () => {
    navigate("/checkin-auth/" + qrCodeData);
  };

  const handleSnackbarClose = () => {
    setErrorStatus(false);
  };

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={errorStatus}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="error">
          An error occurred. Please try again.
        </Alert>
      </Snackbar>
      {qrCodeData ? (
        <QRCode
          size={300}
          onClick={handleQRCodeClick}
          value={basePath + qrCodeData}
        />
      ) : (
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
      )}
    </>
  );
};

export default SigninQRCode;
