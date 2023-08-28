import React from "react";
import SigninQRCode from "../components/SigninQRCode";
import SigninToken from "../components/SigninToken";
import Grid from "@mui/material/Grid";

const CheckInQRPage = () => {
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <SigninToken />
        </Grid>
        <Grid item xs={12}>
          <SigninQRCode />
        </Grid>
      </Grid>
    </>
  );
};

export default CheckInQRPage;
