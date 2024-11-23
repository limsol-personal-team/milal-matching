import { Button, FormControl, Stack, TextField } from '@mui/material';
import React, { useState } from 'react';
import AlertToaster from './AlertToaster';
import { postUserData } from '../utils/serverFunctions';
import { useAuth0 } from '@auth0/auth0-react';
import { MilalFriendFormSchema, UserFormSchema, UserTypes } from '../utils/constants';

export interface UserCreateProps {
  userType: UserTypes
}

export default function UserCreate({ userType } : UserCreateProps) {

  const schema = userType === UserTypes.Volunteers ? UserFormSchema : MilalFriendFormSchema;
  const emptyFormValues = schema.reduce((obj, field) => {
    obj[field.key] = "";
    return obj;
  }, {} as Record<string, string>);

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
    const res = await postUserData(authToken, filledData, userType);
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
        <Button type="submit" variant="contained">Register</Button>
      </form>
    </>
  );
};
