import { Button, FormControl, Stack, TextField, ToggleButton, ToggleButtonGroup, Box } from '@mui/material';
import React, { useState } from 'react';
import AlertToaster from './AlertToaster';
import { postUserData, postEmailAccount } from '../utils/serverFunctions';
import { useAuth0 } from '@auth0/auth0-react';
import { MilalFriendFormSchema, UserFormSchema, EmailAccountFormSchema } from '../utils/formSchemas';
import { UserTypes } from '../utils/constants';

export interface UserCreateProps {
  userType: UserTypes
}

export default function UserCreate({ userType } : UserCreateProps) {
  const { getAccessTokenSilently } = useAuth0();
  
  // Mode state - toggle between User and EmailAccount creation
  const [mode, setMode] = useState<'user' | 'email'>('user');
  
  // Get appropriate schema based on mode and userType
  const getSchema = () => {
    if (mode === 'email') {
      return EmailAccountFormSchema;
    }
    return userType === UserTypes.Volunteers ? UserFormSchema : MilalFriendFormSchema;
  };
  
  const schema = getSchema();
  const emptyFormValues = schema.reduce((obj, field) => {
    obj[field.key] = "";
    return obj;
  }, {} as Record<string, string>);

  const [formValues, setFormValues] = useState(emptyFormValues);
  
  // Alerting
  const [errorStatus, setErrorStatus] = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);
  const alertProps = { errorStatus, setErrorStatus, successStatus, setSuccessStatus}

  const handleModeChange = (event: React.MouseEvent<HTMLElement>, newMode: 'user' | 'email' | null) => {
    if (newMode !== null) {
      setMode(newMode);
      // Reset form when switching modes
      const newSchema = newMode === 'email' ? EmailAccountFormSchema : 
        (userType === UserTypes.Volunteers ? UserFormSchema : MilalFriendFormSchema);
      const newEmptyFormValues = newSchema.reduce((obj, field) => {
        obj[field.key] = "";
        return obj;
      }, {} as Record<string, string>);
      setFormValues(newEmptyFormValues);
    }
  };

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    let filledData: Record<string, any> = Object.keys(formValues).reduce((obj, key) => {
      // @ts-ignore for now
      if (key === 'display_name') {
        // Use blank string for display_name if empty (since it's optional in EmailAccount)
        obj[key] = formValues[key] || "";
      } else {
        // For other fields, only include if they have values
        if (formValues[key]) {
          obj[key] = formValues[key];
        }
      }
      return obj;
    }, {} as Record<string, any>);
    
    const authToken = await getAccessTokenSilently();
    let res;
    
    if (mode === 'email') {
      res = await postEmailAccount(authToken, filledData);
    } else {
      res = await postUserData(authToken, filledData, userType);
    }
    
    if (res.error) {
      setErrorStatus(true);
    } else {
      // Reset form with current schema's empty values
      const currentSchema = getSchema();
      const currentEmptyFormValues = currentSchema.reduce((obj, field) => {
        obj[field.key] = "";
        return obj;
      }, {} as Record<string, string>);
      setFormValues(currentEmptyFormValues);
      setSuccessStatus(true)
    }
  };

  return (
    <>
      <AlertToaster
        {...alertProps}
        successMessage={mode === 'email' ? "Email account created!" : "User created!"}
      />
      
      {/* Mode Toggle */}
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          aria-label="create user or email account"
        >
          <ToggleButton value="user" aria-label="create user">
            Create User
          </ToggleButton>
          <ToggleButton value="email" aria-label="create email">
            Create Email
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <form onSubmit={handleSubmit}>
        <FormControl>
          <Stack spacing={2}>
          {schema.map(({ key, isRequired, props }) => (
            <TextField
              key={key}
              required={isRequired}
              name={props.name}
              label={props.label}
              type={props.type}
              value={formValues[props.name]}
              onChange={handleInputChange}
              // Add any special props conditionally if needed
              InputLabelProps={props.type === "date" ? { shrink: true } : undefined}
            />
          ))}
          </Stack>
        </FormControl>
        <br></br>
        <br></br>
        <Button type="submit" variant="contained">
          {mode === 'email' ? 'Create' : 'Register'}
        </Button>
      </form>
    </>
  );
};
