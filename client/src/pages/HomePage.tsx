import { useAuth0 } from "@auth0/auth0-react";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import * as React from "react";

export default function HomePage() {

  const { isAuthenticated } = useAuth0();
  

  return (
    <Box sx={{ width: "100%" }}>
      <Typography>Welcome to Milal Ops!</Typography>
    </Box>
  );
}
