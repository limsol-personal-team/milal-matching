import { Typography, Button, Box, Alert, FormControlLabel, Checkbox, Chip } from '@mui/material';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { getUserData, sendVolunteerReport, getVolunteerListLightweight } from '../utils/serverFunctions';
import { useAuth0 } from '@auth0/auth0-react';
import { UserTypes, ACTIVE_FILTER_QUERY } from '../utils/constants';
import { SearchScrollList, ScrollListProps } from './SearchScrollList';
import { VolunteerData } from '../types/modelSchema';
import { useActiveFilter } from '../providers/activeFilterProvider';
import AlertToaster from './AlertToaster';
import ApiResponseDisplay from './ApiResponseDisplay';

export default function Report() {
  const { getAccessTokenSilently } = useAuth0();
  const { showActiveOnly } = useActiveFilter();
  
  // User selection state
  const [nameList, setNameList] = useState<Object[]>([]);
  const [usersDataMap, setUsersDataMap] = useState<any>({});
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedUsersData, setSelectedUsersData] = useState<Partial<VolunteerData>[]>([]);
  
  // Report options state
  const [attachHoursLogs, setAttachHoursLogs] = useState<boolean>(false);
  
  // Alert state
  const [errorStatus, setErrorStatus] = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const loadUsers = async () => {
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
      setUsersDataMap(usersDataMap);
    }
  };

  const handleOptionClick = (idList: string[]) => {
    setSelectedUserIds(idList);
    const selectedData = idList.map(id => usersDataMap[id]).filter(Boolean);
    setSelectedUsersData(selectedData);
  };

  const handleSelectAll = () => {
    const allIds = nameList.map((item: any) => item.id);
    setSelectedUserIds(allIds);
    const allData = allIds.map(id => usersDataMap[id]).filter(Boolean);
    setSelectedUsersData(allData);
  };

  const handleDeselectAll = () => {
    setSelectedUserIds([]);
    setSelectedUsersData([]);
  };

  const handleSendReport = async () => {
    if (selectedUserIds.length === 0) {
      return;
    }

    setIsLoading(true);
    setErrorStatus(false);
    setSuccessStatus(false);
    setResult(null);
    
    const authToken = await getAccessTokenSilently();
    const res = await sendVolunteerReport(authToken, selectedUserIds, attachHoursLogs);
    
    if (!res.error) {
      setSuccessStatus(true);
      setResult(res.data);
    } else {
      setErrorStatus(true);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, [showActiveOnly]);

  const scrollListProps: ScrollListProps = {
    initialItemList: nameList,
    handleOptionClick: handleOptionClick,
    isMultiSelect: true,
    selectedIds: selectedUserIds
  };

  const getSuccessMessage = () => {
    if (!result) return '';
    
    if (result.total_sent === 1) {
      return `Volunteer report sent successfully!${attachHoursLogs ? ' Hours logs included.' : ''}`;
    } else {
      let message = `Reports sent for ${result.total_sent} volunteer(s)`;
      
      if (result.total_failed > 0) {
        message += `, ${result.total_failed} failed`;
      }
      
      if (result.total_emails_sent) {
        message += `. Total emails sent: ${result.total_emails_sent}`;
      }
      
      message += attachHoursLogs ? '. Hours logs included.' : '';
      
      return message;
    }
  };

  const isAllSelected = selectedUserIds.length === nameList.length && nameList.length > 0;

  return (
    <>
      <AlertToaster
        errorStatus={errorStatus}
        setErrorStatus={setErrorStatus}
        successStatus={successStatus}
        setSuccessStatus={setSuccessStatus}
        successMessage={getSuccessMessage()}
        errorMessage="Failed to send volunteer reports. Please try again."
      />

      <Typography variant="h5" gutterBottom>
        Send Volunteer Reports
      </Typography>

      {/* Select All Toggle */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleSelectAll}
          disabled={nameList.length === 0}
        >
          Select All ({nameList.length})
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={handleDeselectAll}
          disabled={selectedUserIds.length === 0}
        >
          Deselect All
        </Button>
        {selectedUserIds.length > 0 && (
          <Typography variant="body2" sx={{ alignSelf: 'center', ml: 1 }}>
            {selectedUserIds.length} of {nameList.length} selected
          </Typography>
        )}
      </Box>

      <SearchScrollList {...scrollListProps} />

      {selectedUsersData.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Selected Volunteers ({selectedUsersData.length}):
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            {selectedUsersData.map((user, index) => (
              <Chip
                key={user.id}
                label={`${user.first_name} ${user.last_name}`}
                variant="outlined"
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            This will send PDF reports containing all volunteer hours to all email accounts linked to the selected volunteers.
            {attachHoursLogs && " Detailed text logs of all hours entries will also be attached."}
          </Alert>

          <FormControlLabel
            control={
              <Checkbox
                checked={attachHoursLogs}
                onChange={(e) => setAttachHoursLogs(e.target.checked)}
              />
            }
            label="Attach hours logs"
          />

          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSendReport}
            disabled={isLoading || selectedUserIds.length === 0}
            sx={{ mt: 2 }}
          >
            {isLoading ? 'Sending Reports...' : `Send Reports (${selectedUserIds.length})`}
          </Button>
        </Box>
      )}

      {selectedUsersData.length === 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Select one or more volunteers from the list above to send their reports.
          </Typography>
        </Box>
      )}

      <ApiResponseDisplay response={result} title="Report Response:" />
    </>
  );
} 