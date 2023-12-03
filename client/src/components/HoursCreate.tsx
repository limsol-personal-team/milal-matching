import { Box, Button, FormControl, ListItem, ListItemText, MenuItem, Stack, TextField, Typography } from '@mui/material';
import * as React from 'react';
import { useEffect, useState } from 'react';

import '../static/Antdstyle.css';
import ScrollList from './ScrollList';
import AlertToaster from './AlertToaster';
import { SERVICE_TYPES } from '../utils/constants';
import { convertToDateTimeISO } from '../utils/dateTime';
import { getVolunteerData, postVolunteerHoursBulkCreate } from '../utils/serverFunctions';
import { useAuth0 } from '@auth0/auth0-react';


interface VolunteerData {
  id: string;
  created_at: string;
  last_updated: string;
  description: string;
  dob: string;
  first_name: string;
  last_name: string;
  active: boolean;
  graduation_year: number;
}

interface VolunteerHoursData {
  id: string;
  created_at: string;
  last_updated: string;
  service_type: string;
  service_date: string;
  hours: number;
  description: string;
  volunteer: string;
  email: string;
}

const defaultServiceType = SERVICE_TYPES[0];
const emptyFormValues = {
  service_type: defaultServiceType,
  service_date: '',
  description: '',
  hours: '',
};

export default function HoursCreate() {
  const { getAccessTokenSilently } = useAuth0();

  const [formValues, setFormValues] = useState<any>(emptyFormValues);

  // Pull initial data into structs
  const [nameList, setNameList] = useState<Object[]>([]);
  const [usersDataMap, setData] = useState<any>({});

  // Update specified users
  const [userIds, setUserIds] = useState<Object[]>([]);
  
  // Alerting
  const [errorStatus, setErrorStatus] = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);
  const alertProps = { errorStatus, setErrorStatus, successStatus, setSuccessStatus}

  // @ts-ignore for now
  const handleOptionClick = (idList) => {
    setUserIds(idList);
  }

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    let filledData : any = Object.keys(formValues).reduce((obj, key) => {
      // @ts-ignore for now
      if (formValues[key]) {
      // @ts-ignore for now
        obj[key] = (key === "service_date") ? 
        convertToDateTimeISO(formValues[key]) : formValues[key];
      }
      return obj;
    }, {});
    filledData["volunteer_ids"] = userIds;
    const authToken = await getAccessTokenSilently();
    const res = await postVolunteerHoursBulkCreate(authToken, filledData);
    if (res.error) {
      setErrorStatus(true);
    } else {
      setFormValues(emptyFormValues);
      setSuccessStatus(true)
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = await getAccessTokenSilently();
      const res = await getVolunteerData(token);
      if (!res.error) {
        let nameList = res.data.map(({ first_name, last_name, id }: VolunteerData) => ( 
          { 
            id: id,
            display: first_name + " " + last_name,
          })
        );
        // @ts-ignore for now
        let usersDataMap = res.data.reduce((obj, item) => {
          obj[item.id] = item;
          return obj;
        }, {});
        // Initialize data structs
        setNameList(nameList);
        setData(usersDataMap);
      }
    }
    fetchData();
  }, []);

  const scrollListProps = {
    itemList: nameList,
    handleOptionClick: handleOptionClick,
    isMultiSelect: true
  }

  return (
    <>
      <AlertToaster
        {...alertProps}
        successMessage="Hours created!"
      />
      <form onSubmit={handleSubmit}>
        <FormControl>
          <Stack spacing={2}>
            <ScrollList 
              {...scrollListProps}
            />
            <TextField
              required
              select
              name="service_type"
              label="Service Type"
              defaultValue={defaultServiceType}
              onChange={handleInputChange} 
            >
              {SERVICE_TYPES.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField 
              required
              InputLabelProps={{ shrink: true }} 
              name="service_date" 
              label="Service Date" 
              type="date" 
              value={formValues.service_date} 
              onChange={handleInputChange} 
            />
            <TextField 
              required
              name="hours" 
              label="Hours" 
              type="number" 
              value={formValues.hours} 
              onChange={handleInputChange} 
            />
            <TextField 
              name="description" 
              label="Description" 
              type="text" 
              value={formValues.description} onChange={handleInputChange} 
            />
          </Stack>
        </FormControl>
        <br></br>
        <br></br>
        <Button type="submit" variant="contained">Submit</Button>
      </form>
      <br></br>
      <br></br>
      <Typography variant="h6" sx={{ textDecoration: 'underline' }} gutterBottom>
        Selected users:
      </Typography>
      <div>
        { userIds && userIds.map((key) => (
          <div>
            {/* @ts-ignore for now */}
            {usersDataMap[key].first_name}
          </div>
        ))}
      </div>
    </>
  );
}