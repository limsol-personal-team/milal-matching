import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';

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
  const [emailsDataMap, setEmailsDataMap] = useState({});
  // Update selected entity displayed
  const [emailId, setEmailId] = useState<String[]>([]);
  const [emailData, setEmailData] = useState({});

  // Pull initial data into structs
  const [nameList, setNameList] = useState<Object[]>([]);
  const [usersDataMap, setData] = useState({});
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
            email: email
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
  }

  const handleSubmit = () => {
    let body = { "user": userId[0] };
    axios
      .patch("/api/email_accounts/" + emailId, body)
      .then((response) => {
        // @ts-ignore for now
        setEmailList(emailList.filter(item => item.id != emailId));
        setEmailData({})
        setEmailId([])
      })
      .catch((error) => {
      })
  }

  // @ts-ignore for now
  const handleOptionClick = (id, dataMap, setIdFn, setDataFn) => {
    setIdFn([id]);
    setDataFn(dataMap[id])
  }

  useEffect(() => {
    pullEmailAccounts();
    pullVolunteer();
  }, []);

  return (
    <>
      <FormControl sx={{ m: 1, minWidth: 120, maxWidth: 300 }}>
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
      <FormControl sx={{ m: 1, minWidth: 120, maxWidth: 300 }}>
        <InputLabel shrink htmlFor="select-multiple-native">
          Emails
        </InputLabel>
        <Select
          multiple
          native
          value={emailId}
          // @ts-ignore Typings are not considering `native`
          label="Native"
          inputProps={{
            id: 'select-multiple-native',
          }}
        >
          {/* @ts-ignore */}
          {emailList.map(({id, email}) => ( 
            // @ts-ignore for now
            <option 
              key={id} 
              value={id}
              onClick={() => handleOptionClick(
                id, emailsDataMap, setEmailId, setEmailData)}
            >
              {email}
            </option>
          ))}
        </Select>
      </FormControl>
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
          <p key={emailId}>{key}: {emailData[key] && emailData[key].toString()}</p> // Convert to string for bools
      ))}
    </>
  );
}