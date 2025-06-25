import { Button, FormControl, Stack, TextField, Box, Typography, Select, MenuItem, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import React, { useState } from 'react';
import { putVolunteerHours } from '../utils/serverFunctions';
import { useAuth0 } from '@auth0/auth0-react';
import { VolunteerHoursFormSchema } from '../utils/formSchemas';
import { VolunteerHoursData } from '../types/modelSchema';
import { convertToLocalDateTime, convertToUTCDateTime } from '../utils/dateTime';

export interface VolunteerHoursUpdateProps {
  hoursData: VolunteerHoursData | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onSuccess: () => void;
  onError: () => void;
}

export default function VolunteerHoursUpdate({ hoursData, open, onClose, onUpdate, onSuccess, onError }: VolunteerHoursUpdateProps) {
  const { getAccessTokenSilently } = useAuth0();
  
  // Form state
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Initialize form when hoursData changes
  React.useEffect(() => {
    if (hoursData) {
      const initialFormValues: Record<string, any> = {};
      VolunteerHoursFormSchema.forEach(({ key, props }) => {
        const fieldValue = (hoursData as any)[props.name];
        if (fieldValue !== undefined && fieldValue !== null) {
          // Handle datetime formatting
          if (props.type === 'datetime-local' && fieldValue) {
            initialFormValues[props.name] = convertToLocalDateTime(fieldValue);
          } else {
            initialFormValues[props.name] = fieldValue;
          }
        } else {
          initialFormValues[props.name] = '';
        }
      });
      
      setFormValues(initialFormValues);
      setIsFormValid(true);
    }
  }, [hoursData]);

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!hoursData) return;

    // Filter out empty values and convert datetime to UTC
    let filledData = Object.keys(formValues).reduce((obj, key) => {
      if (formValues[key] !== '' && formValues[key] !== null && formValues[key] !== undefined) {
        // Convert local datetime back to UTC for backend
        if (key === 'service_date' && formValues[key]) {
          obj[key] = convertToUTCDateTime(formValues[key]);
        } else {
          obj[key] = formValues[key];
        }
      }
      return obj;
    }, {} as Record<string, any>);

    const authToken = await getAccessTokenSilently();
    const res = await putVolunteerHours(authToken, hoursData.id, filledData);
    
    if (res.error) {
      onError();
    } else {
      onUpdate(); // Refresh the parent component
      onClose(); // Close dialog immediately
      onSuccess(); // Trigger success alert in parent
    }
  };

  const renderFormField = ({ key, isRequired, props }: any) => {
    if (props.type === 'select') {
      return (
        <FormControl key={key} fullWidth required={isRequired}>
          <InputLabel>{props.label}</InputLabel>
          <Select
            name={props.name}
            value={formValues[props.name] || ''}
            onChange={handleInputChange}
            label={props.label}
          >
            {props.options.map((option: any) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    } else {
      return (
        <TextField
          key={key}
          required={isRequired}
          name={props.name}
          label={props.label}
          type={props.type}
          value={formValues[props.name] || ''}
          onChange={handleInputChange}
          InputLabelProps={props.type === "datetime-local" ? { shrink: true } : undefined}
          fullWidth
        />
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Update Volunteer Hours
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {VolunteerHoursFormSchema.map(renderFormField)}
            </Stack>
          </FormControl>
          
          <Box sx={{ mt: 3 }}>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={!isFormValid}
              sx={{ mr: 2 }}
            >
              Update Hours
            </Button>
            <Button 
              variant="outlined" 
              onClick={onClose}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
} 