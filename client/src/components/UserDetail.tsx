import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import axios from 'axios';
import { Box, ListItem, ListItemText, MenuItem, Typography } from '@mui/material';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

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

export default function UserDetail() {
  // Pull initial data into structs
  const [nameList, setNameList] = useState<Object[]>([]);
  const [usersDataMap, setData] = useState({});

  // Update specified user displayed
  const [userId, setUserId] = useState([]);
  const [userData, setUserData] = useState({});
  const [userVolunteerHours, setUserVolunteerHours] = useState<VolunteerHoursData[]>([])

  useEffect(() => {
    axios
      .get("/api/volunteers")
      .then((response: {data: VolunteerData[]}) => {
        let nameList = response.data.map(({ first_name, last_name, id }) => ( 
          { 
            id: id,
            fullName: first_name + " " + last_name,
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

  // @ts-ignore for now
  const handleOptionClick = (id, dataMap, setIdFn, setDataFn) => {
    setIdFn([id]);
    setDataFn(dataMap[id])
    axios
      .get(`/api/volunteer_hours?volunteer=${id}`)
      .then((response: {data: VolunteerHoursData[]}) => {
        setUserVolunteerHours(response.data);
      })
  }

  const renderRow = (props: ListChildComponentProps) => {
    const {data, index, style} = props; // style is implictily passed by react-window. prevents jittering
    const item = data[index];
    return (
      <ListItem style={style} sx={{ border: '1px solid #808080' }} key={index} component="div" disablePadding>
        <ListItemText 
          primary={`Created: ${item.service_date}`} 
          secondary={
            <Typography variant="body2">
                Service Date: {item.service_date}
                <br></br>
                Type: {item.service_type} 
                <br></br>
                Hours: {item.hours}
            </Typography>
        } 
        />
      </ListItem>
    );
  }

  return (
    <>
      <FormControl sx={{ width: 120 }}>
        <InputLabel shrink htmlFor="select-multiple-native">
          Names
        </InputLabel>
        <Select
          multiple
          native
          value={userId}
          // @ts-ignore Typings are not considering `native`
          label="Native"
          inputProps={{
            id: 'select-multiple-native',
          }}
        >
          {/* @ts-ignore */}
          {nameList.map(({id, fullName}) => ( 
            // @ts-ignore for now
            <option 
              key={id} 
              value={id}
              onClick={() => handleOptionClick(
                id, usersDataMap, setUserId, setUserData)}
            >
              {fullName}
            </option>
          ))}
        </Select>
      </FormControl>
      <br></br>
      <br></br>
      <Typography variant="h6" sx={{ textDecoration: 'underline' }} gutterBottom>
        User Data: 
      </Typography>
      <div>
        { userData && Object.keys(userData).map((key) => (
          // @ts-ignore for now
          <p key={uuid()}>{key}: {userData[key] && userData[key].toString()}</p> // Convert to string for bools
        ))}
      </div>
      { userVolunteerHours.length !== 0 &&
        <Box
          sx={{ width: '100%', height: 400, maxWidth: 360, bgcolor: 'background.paper' }}
        >
          <FixedSizeList
            height={400}
            width={360}
            itemSize={90}
            itemCount={userVolunteerHours.length}
            itemData={userVolunteerHours}
          >
            {renderRow}
          </FixedSizeList>
        </Box>
      }
    </>
  );
}