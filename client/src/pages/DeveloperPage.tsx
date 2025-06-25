import React from "react";
import Grid from "@mui/material/Grid";
import ClearCache from "../components/ClearCache";
import ActiveFilterToggle from "../components/ActiveFilterToggle";
import UpdateVolunteerActiveState from "../components/UpdateVolunteerActiveState";

const DeveloperPage = () => {
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <ActiveFilterToggle />
        </Grid>
        <Grid item xs={12}>
          <ClearCache />
        </Grid>
        <Grid item xs={12}>
          <UpdateVolunteerActiveState />
        </Grid>
      </Grid>
    </>
  );
};

export default DeveloperPage;
