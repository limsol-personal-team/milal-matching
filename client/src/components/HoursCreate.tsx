import { Box, Button, FormControl, ListItem, ListItemText, MenuItem, Stack, TextField, Typography } from '@mui/material';
import axios from 'axios';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { v4 as uuid } from 'uuid';

import '../static/Antdstyle.css';
import ScrollList from './ScrollList';
import AlertToaster from './AlertToaster';
import { SERVICE_TYPES } from '../utils/constants';
import { convertToDateTimeISO } from '../utils/dateTime';


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

  const handleSubmit = (e: { preventDefault: () => void; }) => {
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
    axios
      .post("/api/volunteer_hours/bulk_create", filledData)
      .then((response) => {
        setFormValues(emptyFormValues);
        setSuccessStatus(true)
      })
      .catch((error) => {
        setErrorStatus(true);
      });
  };

  useEffect(() => {
    axios
      .get("/api/volunteers")
      .then((response: {data: VolunteerData[]}) => {
        let nameList = response.data.map(({ first_name, last_name, id }) => ( 
          { 
            id: id,
            display: first_name + " " + last_name,
          })
        );
        let usersDataMap = response.data.reduce((obj, item) => {
          // @ts-ignore for now
          obj[item.id] = item;
          return obj;
        }, {});
        // Initialize data structs
        setNameList(nameList);
        setData(usersDataMap);
      })
      .catch((error) => {
      });
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