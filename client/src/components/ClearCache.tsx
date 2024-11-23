import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
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
      Serializer fields are cached to improve load times of user data. Clear to update.
      <br></br>
      <br></br>
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
            "Clear Serializer Cache"
          )}
      </Button>
      <br></br>
      <br></br>
      <Typography>
        {
          detailData && <>Response Detail: {detailData}</>
        }
      </Typography>
    </>
  );

}

export default ClearCache;