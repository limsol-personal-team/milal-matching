import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import ScrollList from './ScrollList';
import { getEmailAccounts, getVolunteerData, patchEmailAccounts } from '../utils/serverFunctions';
import { useAuth0 } from '@auth0/auth0-react';

interface EmailAccountData {
  id: string;
  created_at: string;
  last_updated: string;
  email: string;
  display_name: string;
  user: string;
}

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

export default function UserDetail() {
  const { getAccessTokenSilently } = useAuth0();
  // Pull initial data into structs
  const [emailList, setEmailList] = useState<Object[]>([]);
  const [emailsDataMap, setEmailsDataMap] = useState<any>({});
  // Update selected entity displayed
  const [emailId, setEmailId] = useState<String>("");
  const [emailData, setEmailData] = useState({});

  // Pull initial data into structs
  const [nameList, setNameList] = useState<Object[]>([]);
  const [usersDataMap, setData] = useState<any>({});
  // Update selected entity displayed
  const [userId, setUserId] = useState<String[]>([]);
  const [userData, setUserData] = useState({});
  
  const pullEmailAccounts = async () => {
    const authToken = await getAccessTokenSilently();
    const queryString = "user__isnull=true";
    const res = await getEmailAccounts(authToken, queryString)
    if (!res.error) {
      let emailList = res.data.map(({ id, email } : EmailAccountData) => ( 
        { 
          id: id,
          display: email
        })
      );
      // @ts-ignore for now
      let emailsDataMap = res.data.reduce((obj, item) => {
        obj[item.id] = item;
        return obj;
      }, {});
      // initialize data structs
      setEmailList(emailList);
      setEmailsDataMap(emailsDataMap);
    }
  }
  
  const pullVolunteer = async () => {
    const authToken = await getAccessTokenSilently();
    const res = await getVolunteerData(authToken);
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

  const handleSubmit = async () => {
    if (!emailId) {
      return;
    }
    let body = { "user": userId };
    const authToken = await getAccessTokenSilently();
    const res = await patchEmailAccounts(authToken, emailId, body);
    if (!res.error) {
      // @ts-ignore for now
      setEmailList(emailList.filter(item => item.id !== emailId));
      setEmailData({})
      setEmailId("");
    }
  }

  // @ts-ignore for now
  const handleNameOptionClick = (idList) => {
    setUserId(idList[0]);
    setUserData(usersDataMap[idList[0]]);
  }

  // @ts-ignore for now
  const handleEmailOptionClick = (idList) => {
    setEmailId(idList[0]);
    setEmailData(emailsDataMap[idList[0]]);
  }

  useEffect(() => {
    pullEmailAccounts();
    pullVolunteer();
  }, []);

  const scrollListNameProps = {
    itemList: nameList,
    handleOptionClick: handleNameOptionClick
  }
  
  const scrollListEmailProps = {
    itemList: emailList,
    handleOptionClick: handleEmailOptionClick
  }

  return (
    <>
      <ScrollList 
        {...scrollListNameProps}
      />
      <br></br>
      <ScrollList 
        {...scrollListEmailProps}
      />
      <br></br>
      <Button 
        type="submit" 
        variant="contained"
        onClick={() => {
          handleSubmit();
        }}
      >
        Link
      </Button>
      <br></br>
      <br></br>
      <Typography variant="h6" sx={{ textDecoration: 'underline' }} gutterBottom>
        Email Data: 
      </Typography>
      { emailData && Object.keys(emailData).map((key) => (
          // @ts-ignore for now
          <p key={uuid()}>{key}: {emailData[key] && emailData[key].toString()}</p> // Convert to string for bools
      ))}
    </>
  );
}