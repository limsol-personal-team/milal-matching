import { Button, FormControl, Stack, TextField } from '@mui/material';
import React, { useState } from 'react';
import AlertToaster from './AlertToaster';
import { postVolunteerData } from '../utils/serverFunctions';
import { useAuth0 } from '@auth0/auth0-react';

const emptyFormValues = {
  first_name: '',
  last_name: '',
  description: '',
  dob: '',
  graduation_year: '',
};

export default function UserCreate() {
  const { getAccessTokenSilently } = useAuth0();
  const [formValues, setFormValues] = useState(emptyFormValues);
  
  // Alerting
  const [errorStatus, setErrorStatus] = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);
  const alertProps = { errorStatus, setErrorStatus, successStatus, setSuccessStatus}

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    let filledData = Object.keys(formValues).reduce((obj, key) => {
      // @ts-ignore for now
      if (formValues[key]) {
      // @ts-ignore for now
        obj[key] = formValues[key];
      }
      return obj;
    }, {});
    const authToken = await getAccessTokenSilently();
    const res = await postVolunteerData(authToken, filledData);
    if (res.error) {
      setErrorStatus(true);
    } else {
      setFormValues(emptyFormValues);
      setSuccessStatus(true)
    }
  };

  return (
    <>
      <AlertToaster
        {...alertProps}
        successMessage="User created!"
      />
      <form onSubmit={handleSubmit}>
        <FormControl>
          <Stack spacing={2}>
            <TextField 
              required
              name="first_name" 
              label="First Name" 
              type="text" 
              value={formValues.first_name} 
              onChange={handleInputChange} 
            />
            <TextField 
              required
              name="last_name" 
              label="Last Name" 
              type="text" 
              value={formValues.last_name} 
              onChange={handleInputChange} 
            />
            <TextField 
              name="description" 
              label="Description" 
              type="text" 
              value={formValues.description} onChange={handleInputChange} 
            />
            <TextField 
              InputLabelProps={{ shrink: true }} 
              name="dob" 
              label="Date of Birth" 
              type="date" 
              value={formValues.dob} 
              onChange={handleInputChange} 
            />
            <TextField 
              name="graduation_year" 
              label="Graduation Year" 
              type="number" 
              value={formValues.graduation_year} 
              onChange={handleInputChange} 
            />
          </Stack>
        </FormControl>
        <br></br>
        <br></br>
        <Button type="submit" variant="contained">Register</Button>
      </form>
    </>
  );
};
