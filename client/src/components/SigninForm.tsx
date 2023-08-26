import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import axios from "axios";
import React, { useState } from "react";

const CheckInPage = (props: any) => {
  const { email, name } = props.googleInfo;
  const [submissionStatus, setSubmissionStatus] = useState(false);
  const [errorStatus, setErrorStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const textFieldStyles = {
    background: "white",
  };

  const handleSubmit = () => {
    const data = {
      email: email,
      name: name,
      timestamp: new Date().toLocaleString(),
    };
    setIsLoading(true);

    axios
      .post("http://localhost:8000/auth/sign_in_record/", data)
      .then((response) => {
        setSubmissionStatus(true);
        setIsLoading(true);
      })
      .catch((error) => {
        setIsLoading(false);
        setErrorStatus(true);
      });
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
      {submissionStatus ? (
        <Alert severity="success">Check-in succeeded!</Alert>
      ) : (
        <Grid container spacing={2} sx={{ flexDirection: { xs: "column", md: "row" } }}>
          <Grid item xs={12} md={2}>
            <TextField
              id="outlined-read-only-input"
              label="Name"
              defaultValue={name}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              id="outlined-read-only-input"
              label="Email"
              defaultValue={email}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
          <Grid item xs={12} md={12}>
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
                "Check-in"
              )}
            </Button>
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default CheckInPage;
