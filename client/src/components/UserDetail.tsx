import { Box, ListItem, ListItemText, Typography } from '@mui/material';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { v4 as uuid } from 'uuid';
import { getUserData, getVolunteerHours } from '../utils/serverFunctions';

import '../static/Antdstyle.css';
import { useAuth0 } from '@auth0/auth0-react';
import { UserTypes } from '../utils/constants';
import { ScrollListProps, SearchScrollList } from './SearchScrollList';
import { VolunteerData, VolunteerHoursData } from '../types/modelSchema';

export interface UserDetailProps {
  userType: UserTypes
}

export default function UserDetail( { userType } : UserDetailProps) {
  const { getAccessTokenSilently } = useAuth0();
  // Pull initial data into structs
  const [nameList, setNameList] = useState<Object[]>([]);
  const [usersDataMap, setData] = useState<any>({});

  // Update specified user displayed
  const [userId, setUserId] = useState<Object[]>([]);
  const [userData, setUserData] = useState({});
  const [userVolunteerHours, setUserVolunteerHours] = useState<VolunteerHoursData[]>([])

  // @ts-ignore for now
  const handleOptionClick = async (idList) => {
    setUserId(idList[0]);
    setUserData(usersDataMap[idList[0]]);

    // For volunteer page, fetch hours
    if (userType === UserTypes.Volunteers) {
      const authToken = await getAccessTokenSilently();
      const res = await getVolunteerHours(authToken, idList[0]);
      if (!res.error) {
        setUserVolunteerHours(res.data);
      }
    }
  }
  
  const pullVolunteer = async () => {
    const authToken = await getAccessTokenSilently();
    const res = await getUserData(authToken, userType);
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

  useEffect(() => {
    pullVolunteer()
  }, []);

  const scrollListProps: ScrollListProps = {
    initialItemList: nameList,
    handleOptionClick: handleOptionClick
  }

  const renderRow = (props: ListChildComponentProps) => {
    const {data, index, style} = props; // style is implictily passed by react-window. prevents jittering
    const item = data[index];
    return (
      <ListItem style={style} sx={{ border: '1px solid #808080' }} key={index} component="div" disablePadding>
        <ListItemText 
          primary={`Created: ${item.created_at}`} 
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

  // TODO fix typing
  const renderField = (key: string, data: any) => {
    const keyToCheck: keyof VolunteerData = "recommended_match";
    if (key === keyToCheck) {
      return data.map(
        (item : any) => `${item.name} (${item.count})`).join(", ")
    } else {
      return data.toString()
    }
  }

  return (
    <>
      <SearchScrollList 
        {...scrollListProps}
      />
      <br></br>
      <Typography variant="h6" sx={{ textDecoration: 'underline' }} gutterBottom>
        User Data: 
      </Typography>
      <div>
        { userData && Object.keys(userData).map((key) => (
          // @ts-ignore for now
          <p key={uuid()}>{key}: {userData[key] && renderField(key, userData[key])}</p> // Convert to string for bools
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