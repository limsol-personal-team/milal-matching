import React from "react";
import Grid from "@mui/material/Grid";
import ClearCache from "../components/ClearCache";

const DeveloperPage = () => {
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <ClearCache />
        </Grid>
      </Grid>
    </>
  );
};

export default DeveloperPage;
