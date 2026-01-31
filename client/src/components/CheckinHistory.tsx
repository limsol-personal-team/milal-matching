import { Box, TextField, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getCheckinHistory } from '../utils/serverFunctions';
import AlertToaster from './AlertToaster';
import { getCurrentDateTimeISO } from '../utils/dateTime';

interface CheckinRecord {
  id: string;
  service_date: string;
  display_name: string;
  email: string;
}

export default function CheckinHistory() {
  const { getAccessTokenSilently } = useAuth0();

  const [selectedDate, setSelectedDate] = useState(getCurrentDateTimeISO(true));
  const [checkinData, setCheckinData] = useState<CheckinRecord[]>([]);

  const [errorStatus, setErrorStatus] = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);
  const alertProps = { errorStatus, setErrorStatus, successStatus, setSuccessStatus };

  useEffect(() => {
    if (selectedDate) {
      fetchCheckinData(selectedDate);
    }
  }, [selectedDate]);

  const fetchCheckinData = async (date: string) => {
    try {
      const authToken = await getAccessTokenSilently();
      const res = await getCheckinHistory(authToken, date);

      if (!res.error) {
        setCheckinData(res.data);
      } else {
        setErrorStatus(true);
      }
    } catch (error) {
      setErrorStatus(true);
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <AlertToaster
        {...alertProps}
        successMessage="Check-in data loaded"
      />

      <TextField
        label="Select Date"
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />

      <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
        {checkinData.length} volunteer{checkinData.length !== 1 ? 's' : ''} checked in
      </Typography>

      <Paper elevation={2} sx={{ mt: 1, p: 1, flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', width: '100%' }}>
        {checkinData.length > 0 ? (
          <List sx={{ overflow: 'auto', maxHeight: '50vh', width: '100%' }}>
            {checkinData.map((record) => (
              <ListItem key={record.id}>
                <ListItemText
                  primary={record.display_name || record.email}
                  secondary={`${record.email} — ${new Date(record.service_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
            No check-ins found for this date.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
