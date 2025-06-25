import { Typography, Button, Box, Accordion, AccordionSummary, AccordionDetails, ToggleButton, ToggleButtonGroup } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { getEmailAccounts, getUserData, patchEmailAccounts, getVolunteerListLightweight } from '../utils/serverFunctions';
import { useAuth0 } from '@auth0/auth0-react';
import { UserTypes, ACTIVE_FILTER_QUERY } from '../utils/constants';
import { SearchScrollList } from './SearchScrollList';
import { useActiveFilter } from '../providers/activeFilterProvider';
import AlertToaster from './AlertToaster';
import { renderField } from '../utils/fieldRenderer';

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

export interface UserLinkProps {
  userType: UserTypes
}

export default function UserLink({ userType } : UserLinkProps) {
  const { getAccessTokenSilently } = useAuth0();
  const { showActiveOnly } = useActiveFilter();
  
  // Pull initial data into structs
  const [unlinkedEmailList, setUnlinkedEmailList] = useState<Object[]>([]);
  const [unlinkedEmailsDataMap, setUnlinkedEmailsDataMap] = useState<any>({});

  // Update selected entity displayed
  const [selectedUnlinkedEmailId, setSelectedUnlinkedEmailId] = useState<string>("");
  const [selectedUnlinkedEmailData, setSelectedUnlinkedEmailData] = useState<any>({});

  // User selection state
  const [nameList, setNameList] = useState<Object[]>([]);
  const [usersDataMap, setData] = useState<any>({});
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUserData, setSelectedUserData] = useState<any>({});

  // User's linked email accounts (for delink mode)
  const [userLinkedEmails, setUserLinkedEmails] = useState<Object[]>([]);
  const [userLinkedEmailsDataMap, setUserLinkedEmailsDataMap] = useState<any>({});
  const [selectedLinkedEmailId, setSelectedLinkedEmailId] = useState<string>("");
  const [selectedLinkedEmailData, setSelectedLinkedEmailData] = useState<any>({});

  // Mode state
  const [mode, setMode] = useState<'link' | 'delink'>('link');
  
  // Alert state
  const [errorStatus, setErrorStatus] = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);

  const pullUnlinkedEmailAccounts = async () => {
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
      setUnlinkedEmailList(emailList);
      setUnlinkedEmailsDataMap(emailsDataMap);
    }
  }

  const pullUserLinkedEmailAccounts = async (userId: string) => {
    const authToken = await getAccessTokenSilently();
    const queryString = `user=${userId}`;
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
      setUserLinkedEmails(emailList);
      setUserLinkedEmailsDataMap(emailsDataMap);
    }
  }
  
  const pullUsers = async () => {
    const authToken = await getAccessTokenSilently();
    const queryString = showActiveOnly ? ACTIVE_FILTER_QUERY : undefined;
    const res = await getVolunteerListLightweight(authToken, queryString);
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
      setNameList(nameList);
      setData(usersDataMap);
    }
  }

  const handleLinkSubmit = async () => {
    if (!selectedUnlinkedEmailId || !selectedUserId) {
      return;
    }
    let body = { "user": selectedUserId };
    const authToken = await getAccessTokenSilently();
    const res = await patchEmailAccounts(authToken, selectedUnlinkedEmailId, body);
    if (!res.error) {
      setSuccessStatus(true);
      // Refresh unlinked email accounts list
      await pullUnlinkedEmailAccounts();
      setSelectedUnlinkedEmailData({});
      setSelectedUnlinkedEmailId("");
    } else {
      setErrorStatus(true);
    }
  }

  const handleDelinkSubmit = async () => {
    if (!selectedLinkedEmailId) {
      return;
    }
    let body = { "user": null };
    const authToken = await getAccessTokenSilently();
    const res = await patchEmailAccounts(authToken, selectedLinkedEmailId, body);
    if (!res.error) {
      setSuccessStatus(true);
      // Refresh lists
      await pullUnlinkedEmailAccounts();
      // Refresh user's linked emails if we're still in delink mode
      if (mode === 'delink' && selectedUserId) {
        await pullUserLinkedEmailAccounts(selectedUserId);
      }
      setSelectedLinkedEmailData({});
      setSelectedLinkedEmailId("");
    } else {
      setErrorStatus(true);
    }
  }

  const handleModeChange = (event: React.MouseEvent<HTMLElement>, newMode: 'link' | 'delink' | null) => {
    if (newMode !== null) {
      setMode(newMode);
      // Clear selections when switching modes
      setSelectedUnlinkedEmailData({});
      setSelectedUnlinkedEmailId("");
      setSelectedLinkedEmailData({});
      setSelectedLinkedEmailId("");
      setSelectedUserData({});
      setSelectedUserId("");
      setUserLinkedEmails([]);
      setUserLinkedEmailsDataMap({});
    }
  };

  // @ts-ignore for now
  const handleNameOptionClick = (idList) => {
    setSelectedUserId(idList[0]);
    setSelectedUserData(usersDataMap[idList[0]]);
    
    // If in delink mode, fetch the user's linked email accounts
    if (mode === 'delink') {
      pullUserLinkedEmailAccounts(idList[0]);
    }
  }

  // @ts-ignore for now
  const handleUnlinkedEmailOptionClick = (idList) => {
    setSelectedUnlinkedEmailId(idList[0]);
    setSelectedUnlinkedEmailData(unlinkedEmailsDataMap[idList[0]]);
  }

  // @ts-ignore for now
  const handleUserLinkedEmailOptionClick = (idList) => {
    setSelectedLinkedEmailId(idList[0]);
    setSelectedLinkedEmailData(userLinkedEmailsDataMap[idList[0]]);
  }

  useEffect(() => {
    pullUnlinkedEmailAccounts();
    pullUsers();
  }, [showActiveOnly]);

  const scrollListNameProps = {
    initialItemList: nameList,
    handleOptionClick: handleNameOptionClick
  }
  
  const scrollListUnlinkedEmailProps = {
    initialItemList: unlinkedEmailList,
    handleOptionClick: handleUnlinkedEmailOptionClick
  }

  const scrollListLinkedEmailProps = {
    initialItemList: userLinkedEmails,
    handleOptionClick: handleUserLinkedEmailOptionClick
  }

  const scrollListUserLinkedEmailProps = {
    initialItemList: userLinkedEmails,
    handleOptionClick: handleUserLinkedEmailOptionClick
  }

  return (
    <>
      <AlertToaster
        errorStatus={errorStatus}
        setErrorStatus={setErrorStatus}
        successStatus={successStatus}
        setSuccessStatus={setSuccessStatus}
        successMessage={mode === 'link' ? "Email account linked successfully!" : "Email account delinked successfully!"}
        errorMessage="Failed to update email account. Please try again."
      />

      {/* Mode Toggle */}
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          aria-label="link or delink mode"
        >
          <ToggleButton value="link" aria-label="link mode">
            Link Email Account
          </ToggleButton>
          <ToggleButton value="delink" aria-label="delink mode">
            Delink Email Account
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Link Mode */}
      {mode === 'link' && (
        <>
          {/* User Selection Accordion */}
          <Accordion defaultExpanded={false} sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Select User to Link
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <SearchScrollList {...scrollListNameProps} />
              {selectedUserData && Object.keys(selectedUserData).length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ textDecoration: 'underline' }} gutterBottom>
                    Selected User: 
                  </Typography>
                  {Object.keys(selectedUserData).map((key) => (
                    // @ts-ignore for now
                    <p key={uuid()}>{key}: {selectedUserData[key] && renderField(key, selectedUserData[key])}</p>
                  ))}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Unlinked Email Accounts Accordion */}
          <Accordion defaultExpanded={false} sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Select Unlinked Email Account ({unlinkedEmailList.length} available)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <SearchScrollList {...scrollListUnlinkedEmailProps} />
              {selectedUnlinkedEmailData && Object.keys(selectedUnlinkedEmailData).length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ textDecoration: 'underline' }} gutterBottom>
                    Selected Email Account: 
                  </Typography>
                  {Object.keys(selectedUnlinkedEmailData).map((key) => (
                    // @ts-ignore for now
                    <p key={uuid()}>{key}: {selectedUnlinkedEmailData[key] && renderField(key, selectedUnlinkedEmailData[key])}</p>
                  ))}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Link Button */}
          <Box sx={{ mt: 2 }}>
            <Button 
              type="submit" 
              variant="contained"
              disabled={!selectedUnlinkedEmailId || !selectedUserId}
              onClick={handleLinkSubmit}
            >
              Link Email Account
            </Button>
          </Box>
        </>
      )}

      {/* Delink Mode */}
      {mode === 'delink' && (
        <>
          {/* User Selection Accordion */}
          <Accordion defaultExpanded={false} sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Select User to Delink Email Accounts From
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <SearchScrollList {...scrollListNameProps} />
              {selectedUserData && Object.keys(selectedUserData).length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ textDecoration: 'underline' }} gutterBottom>
                    Selected User: 
                  </Typography>
                  {Object.keys(selectedUserData).map((key) => (
                    // @ts-ignore for now
                    <p key={uuid()}>{key}: {selectedUserData[key] && renderField(key, selectedUserData[key])}</p>
                  ))}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>

          {/* User's Linked Email Accounts Accordion */}
          {selectedUserId && (
            <Accordion defaultExpanded={false} sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Select Email Account to Delink ({userLinkedEmails.length} linked)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <SearchScrollList {...scrollListUserLinkedEmailProps} />
                {selectedLinkedEmailData && Object.keys(selectedLinkedEmailData).length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ textDecoration: 'underline' }} gutterBottom>
                      Selected Email Account: 
                    </Typography>
                    {Object.keys(selectedLinkedEmailData).map((key) => (
                      // @ts-ignore for now
                      <p key={uuid()}>{key}: {selectedLinkedEmailData[key] && renderField(key, selectedLinkedEmailData[key])}</p>
                    ))}
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          )}

          {/* Delink Button */}
          <Box sx={{ mt: 2 }}>
            <Button 
              type="submit" 
              variant="contained"
              color="warning"
              disabled={!selectedLinkedEmailId}
              onClick={handleDelinkSubmit}
            >
              Delink Email Account
            </Button>
          </Box>
        </>
      )}
    </>
  );
}