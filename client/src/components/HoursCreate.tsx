import { Box, Button, Chip, FormControl, MenuItem, Stack, TextField, Typography } from '@mui/material';
import * as React from 'react';
import { useEffect, useState } from 'react';

import '../static/Antdstyle.css';
import ScrollList from './ScrollList';
import AlertToaster from './AlertToaster';
import { SERVICE_TYPES, UserTypes, ACTIVE_FILTER_QUERY } from '../utils/constants';
import { convertToDateTimeISO } from '../utils/dateTime';
import { getUserData, postVolunteerHoursBulkCreate, getVolunteerListLightweight } from '../utils/serverFunctions';
import { useAuth0 } from '@auth0/auth0-react';
import { ScrollListProps, SearchScrollList } from './SearchScrollList';
import { useActiveFilter } from '../providers/activeFilterProvider';


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
  const { showActiveOnly } = useActiveFilter();

  const [formValues, setFormValues] = useState<any>(emptyFormValues);

  // Pull initial data into structs
  const [nameList, setNameList] = useState<Object[]>([]);
  const [usersDataMap, setData] = useState<any>({});

  // Update specified users
  const [userIds, setUserIds] = useState<string[]>([]);
  const [selectedUsersData, setSelectedUsersData] = useState<any[]>([]);
  
  // Alerting
  const [errorStatus, setErrorStatus] = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);
  const alertProps = { errorStatus, setErrorStatus, successStatus, setSuccessStatus}

  const handleOptionClick = (idList: string[]) => {
    setUserIds(idList);
    setSelectedUsersData(idList.map(id => usersDataMap[id]).filter(Boolean));
  };

  const handleDeselectVolunteer = (id: string) => {
    const updatedIds = userIds.filter(uid => uid !== id);
    setUserIds(updatedIds);
    setSelectedUsersData(updatedIds.map(uid => usersDataMap[uid]).filter(Boolean));
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
    let filledData : any = Object.keys(formValues).reduce((obj, key) => {
      // @ts-ignore for now
      if (formValues[key]) {
      // @ts-ignore for now
        obj[key] = (key === "service_date") ? 
        convertToDateTimeISO(new Date(formValues[key])) : formValues[key];
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
      const queryString = showActiveOnly ? ACTIVE_FILTER_QUERY : undefined;
      const res = await getVolunteerListLightweight(token, queryString);
      if (!res.error) {
        let nameList = res.data.map(({ first_name, last_name, id }: any) => ( 
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
  }, [showActiveOnly]);

  const scrollListProps: ScrollListProps = {
    initialItemList: nameList,
    handleOptionClick: handleOptionClick,
    isMultiSelect: true,
    selectedIds: userIds
  };

  return (
    <>
      <AlertToaster
        {...alertProps}
        successMessage="Hours created!"
      />
      <SearchScrollList 
        {...scrollListProps}
      />
      <form onSubmit={handleSubmit}>
        <FormControl>
          <Stack spacing={2}>
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
      {selectedUsersData.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Selected Volunteers ({selectedUsersData.length}):
          </Typography>
          <Box>
            {selectedUsersData.map((user) => (
              <Chip
                key={user.id}
                label={`${user.first_name} ${user.last_name}`}
                variant="outlined"
                onClick={() => handleDeselectVolunteer(user.id)}
                sx={{ mr: 1, mb: 1, cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>
      )}
    </>
  );
}