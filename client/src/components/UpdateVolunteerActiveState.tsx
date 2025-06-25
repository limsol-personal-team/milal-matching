import { Typography, Button, Box, Alert, Paper, TextField, FormControlLabel, Switch } from '@mui/material';
import * as React from 'react';
import { useState } from 'react';
import { updateVolunteerActiveState } from '../utils/serverFunctions';
import { useAuth0 } from '@auth0/auth0-react';
import AlertToaster from './AlertToaster';
import ApiResponseDisplay from './ApiResponseDisplay';

export default function UpdateVolunteerActiveState() {
  const { getAccessTokenSilently } = useAuth0();
  
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [useCustomCutoff, setUseCustomCutoff] = useState(false);
  const [cutoffDate, setCutoffDate] = useState('');

  const handleUpdateActiveState = async () => {
    setIsLoading(true);
    setErrorStatus(false);
    setSuccessStatus(false);
    setResult(null);

    try {
      const authToken = await getAccessTokenSilently();
      const cutoffDateParam = useCustomCutoff && cutoffDate ? cutoffDate : undefined;
      const res = await updateVolunteerActiveState(authToken, cutoffDateParam);
      
      if (!res.error) {
        setSuccessStatus(true);
        setResult(res.data);
      } else {
        setErrorStatus(true);
      }
    } catch (error) {
      setErrorStatus(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AlertToaster
        errorStatus={errorStatus}
        setErrorStatus={setErrorStatus}
        successStatus={successStatus}
        setSuccessStatus={setSuccessStatus}
        successMessage="Volunteer active states updated successfully!"
        errorMessage="Failed to update volunteer active states. Please try again."
      />

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          Update Volunteer Active States
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Volunteers will be marked as active if user is created within the cutoff date, OR if user has volunteer hours with a service date within the cutoff date. Default is 1 year if not specified.
        </Typography>
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={useCustomCutoff}
                onChange={(e) => setUseCustomCutoff(e.target.checked)}
              />
            }
            label="Use custom cutoff date"
          />
          
          {useCustomCutoff && (
            <TextField
              type="date"
              label="Cutoff Date"
              value={cutoffDate}
              onChange={(e) => setCutoffDate(e.target.value)}
              fullWidth
              sx={{ mt: 1 }}
              InputLabelProps={{ shrink: true }}
              helperText="Leave empty to use default (1 year ago from now)"
            />
          )}
        </Box>

        <Button 
          variant="contained" 
          color="primary"
          onClick={handleUpdateActiveState}
          disabled={isLoading}
        >
          {isLoading ? 'Updating...' : 'Update Active States'}
        </Button>

        <ApiResponseDisplay response={result} />
      </Paper>
    </>
  );
} 