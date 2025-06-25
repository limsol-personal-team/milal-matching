import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Stack, TextField } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { patchEmailAccounts } from '../utils/serverFunctions';
import { useAuth0 } from '@auth0/auth0-react';

interface EmailAccountData {
  id: string;
  created_at: string;
  last_updated: string;
  email: string;
  display_name: string;
  user: string;
}

interface EmailAccountUpdateProps {
  emailData: EmailAccountData | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onSuccess: () => void;
  onError: () => void;
}

export default function EmailAccountUpdate({ 
  emailData, 
  open, 
  onClose, 
  onUpdate, 
  onSuccess, 
  onError 
}: EmailAccountUpdateProps) {
  const { getAccessTokenSilently } = useAuth0();
  const [formValues, setFormValues] = useState({
    email: '',
    display_name: ''
  });
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    if (emailData) {
      setFormValues({
        email: emailData.email || '',
        display_name: emailData.display_name || ''
      });
      setIsFormValid(true);
    }
  }, [emailData]);

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate form
    const newValues = { ...formValues, [name]: value };
    setIsFormValid(newValues.email.trim() !== '' && newValues.display_name.trim() !== '');
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!emailData || !isFormValid) return;

    onUpdate();
    const authToken = await getAccessTokenSilently();
    const res = await patchEmailAccounts(authToken, emailData.id, formValues);
    
    if (!res.error) {
      onSuccess();
      onClose();
    } else {
      onError();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Email Account</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <FormControl fullWidth>
            <Stack spacing={2}>
              <TextField
                label="Email"
                name="email"
                value={formValues.email}
                onChange={handleInputChange}
                required
                fullWidth
              />
              <TextField
                label="Display Name"
                name="display_name"
                value={formValues.display_name}
                onChange={handleInputChange}
                required
                fullWidth
              />
            </Stack>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={!isFormValid}
          >
            Update Email Account
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 