import { Typography, Box, Button, CircularProgress } from "@mui/material";
import React, { useEffect, useState } from "react";
import AlertToaster from "./AlertToaster";
import { postClearSerializerCache } from "../utils/serverFunctions";
import { useAuth0 } from "@auth0/auth0-react";

const ClearCache = () => {
  const { getAccessTokenSilently } = useAuth0();
  
  // Alerting
  const [errorStatus, setErrorStatus] = useState(false);
  const alertProps = { errorStatus, setErrorStatus}

  const [detailData, setDetailData] =  useState("");
  const [isLoading, setIsLoading] =  useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    const authToken = await getAccessTokenSilently();
    const res = await postClearSerializerCache(authToken);
    if (res.error) {
      setErrorStatus(true);
      setIsLoading(false);
    } else {
      setDetailData(res.data.detail)
      setIsLoading(false);
    }
  }

  return (
    <>
      <AlertToaster {...alertProps}/>
      <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#fafafa' }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          Cache Management
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Serializer fields are cached to improve load times of user data. Clear to update.
        </Typography>
        <Button
          variant="contained"
          size="medium"
          onClick={handleSubmit}
          disabled={isLoading}
          sx={{ mb: 2 }}
        >
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Clear Serializer Cache"
          )}
        </Button>
        {detailData && (
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}>
            Response: {detailData}
          </Typography>
        )}
      </Box>
    </>
  );
}

export default ClearCache;