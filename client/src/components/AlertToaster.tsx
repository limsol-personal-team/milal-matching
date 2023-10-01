import { Alert, Snackbar } from '@mui/material';
import React from 'react';

// @ts-ignore for now
export default function AlertToaster(props) {

  const { 
    errorStatus, 
    setErrorStatus,
    successStatus,
    setSuccessStatus,
    successMessage
  } = props;

  const handleSnackbarClose = (setStatusFn: Function) => {
    setStatusFn(false);
  };

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={errorStatus}
        autoHideDuration={2000}
        onClose={() => handleSnackbarClose(setErrorStatus)}
      >
        <Alert onClose={() => handleSnackbarClose(setErrorStatus)} severity="error">
          An error occurred. Please try again.
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={successStatus}
        autoHideDuration={2000}
        onClose={() => handleSnackbarClose(setSuccessStatus)}
      >
        <Alert onClose={() => handleSnackbarClose(setSuccessStatus)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  )
}