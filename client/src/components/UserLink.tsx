import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import axios from 'axios';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import ScrollList from './ScrollList';

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
  
  const pullEmailAccounts = () => {
    axios
      .get("/api/email_accounts?user__isnull=true")
      .then((response: {data: EmailAccountData[]}) => {
        let emailList = response.data.map(({ id, email }) => ( 
          { 
            id: id,
            display: email
          })
        );
        let emailsDataMap = response.data.reduce((obj, item) => {
          // @ts-ignore for now
          obj[item.id] = item;
          return obj;
        }, {});
        // initialize data structs
        setEmailList(emailList);
        setEmailsDataMap(emailsDataMap);
      })
      .catch((error) => {
      });
  }
  
  const pullVolunteer = () => {
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
  }

  const handleSubmit = () => {
    if (!emailId) {
      return;
    }
    let body = { "user": userId };
    axios
      .patch("/api/email_accounts/" + emailId, body)
      .then((response) => {
        // @ts-ignore for now
        setEmailList(emailList.filter(item => item.id !== emailId));
        setEmailData({})
        setEmailId("");
      })
      .catch((error) => {
      })
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