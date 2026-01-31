import { Button, FormControl, Stack, TextField, Box, Typography, FormControlLabel, Switch, Accordion, AccordionSummary, AccordionDetails, ToggleButton, ToggleButtonGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import AlertToaster from './AlertToaster';
import { getUserData, putUserData, getVolunteerHours, getEmailAccounts, getVolunteerListLightweight, deleteUserData } from '../utils/serverFunctions';
import { useAuth0 } from '@auth0/auth0-react';
import { UserFormSchema } from '../utils/formSchemas';
import { UserTypes, ACTIVE_FILTER_QUERY } from '../utils/constants';
import { VolunteerData, VolunteerHoursData } from '../types/modelSchema';
import { SearchScrollList, ScrollListProps } from './SearchScrollList';
import { useActiveFilter } from '../providers/activeFilterProvider';
import VolunteerHoursUpdate from './VolunteerHoursUpdate';
import EmailAccountUpdate from './EmailAccountUpdate';
import { renderField } from '../utils/fieldRenderer';

export interface UserUpdateProps {
  userType: UserTypes
}

export default function UserUpdate({ userType }: UserUpdateProps) {
  const { getAccessTokenSilently } = useAuth0();
  const { showActiveOnly } = useActiveFilter();
  
  const [nameList, setNameList] = useState<Object[]>([]);
  const [usersDataMap, setData] = useState<any>({});
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserData, setSelectedUserData] = useState<VolunteerData | null>(null);
  const [userVolunteerHours, setUserVolunteerHours] = useState<VolunteerHoursData[]>([]);
  const [userLinkedEmails, setUserLinkedEmails] = useState<any[]>([]);
  
  // Form state
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  // View/Update mode toggle
  const [mode, setMode] = useState<'view' | 'update'>('view');
  
  // Volunteer hours update dialog
  const [selectedHoursData, setSelectedHoursData] = useState<VolunteerHoursData | null>(null);
  const [hoursUpdateOpen, setHoursUpdateOpen] = useState(false);
  
  // Email account update state
  const [selectedEmailData, setSelectedEmailData] = useState<any>(null);
  const [emailUpdateOpen, setEmailUpdateOpen] = useState(false);
  
  // Alerting
  const [errorStatus, setErrorStatus] = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);
  const alertProps = { errorStatus, setErrorStatus, successStatus, setSuccessStatus };

  // Load lightweight users data for the list
  const loadUsersList = async () => {
    const authToken = await getAccessTokenSilently();
    const queryString = showActiveOnly ? ACTIVE_FILTER_QUERY : undefined;
    
    if (userType === UserTypes.Volunteers) {
      // Use lightweight endpoint for volunteers
      const res = await getVolunteerListLightweight(authToken, queryString);
      if (!res.error) {
        let nameList = res.data.map(({ first_name, last_name, id }: any) => ({
          id: id,
          display: first_name + " " + last_name,
        }));
        setNameList(nameList);
      }
    } else {
      // Use regular endpoint for other user types
      const res = await getUserData(authToken, userType, queryString);
      if (!res.error) {
        let nameList = res.data.map(({ first_name, last_name, id }: VolunteerData) => ({
          id: id,
          display: first_name + " " + last_name,
        }));
        
        let usersDataMap = res.data.reduce((obj: any, item: any) => {
          obj[item.id] = item;
          return obj;
        }, {});
        
        setNameList(nameList);
        setData(usersDataMap);
      }
    }
  };

  // Load full user data for a specific user
  const loadFullUserData = async (userId: string) => {
    const authToken = await getAccessTokenSilently();
    const res = await getUserData(authToken, userType, `id=${userId}`);
    if (!res.error && res.data.length > 0) {
      const userData = res.data[0];
      setData((prev: any) => ({ ...prev, [userId]: userData }));
      return userData;
    }
    return null;
  };

  // Load volunteer hours
  const loadVolunteerHours = async (volunteerId: string) => {
    const authToken = await getAccessTokenSilently();
    const res = await getVolunteerHours(authToken, volunteerId);
    if (!res.error) {
      setUserVolunteerHours(res.data);
    }
  };

  const loadLinkedEmails = async (userId: string) => {
    const authToken = await getAccessTokenSilently();
    const queryString = `user=${userId}`;
    const res = await getEmailAccounts(authToken, queryString);
    if (!res.error) {
      setUserLinkedEmails(res.data);
    }
  };

  // Handle user selection
  const handleOptionClick = async (idList: string[]) => {
    const userId = idList[0];
    setSelectedUserId(userId);
    
    // Always fetch fresh user data to ensure we have the latest information
    const userData = await loadFullUserData(userId);
    
    if (userData) {
      setSelectedUserData(userData);
      
      // Pre-populate form with existing data from UserFormSchema fields only
      const initialFormValues: Record<string, any> = {};
      UserFormSchema.forEach(({ key, props }) => {
        if (userData[props.name] !== undefined && userData[props.name] !== null) {
          // Handle date formatting
          if (props.type === 'date' && userData[props.name]) {
            initialFormValues[props.name] = userData[props.name].split('T')[0];
          } else {
            initialFormValues[props.name] = userData[props.name];
          }
        } else {
          // Set default values based on field type
          if (props.type === 'boolean') {
            initialFormValues[props.name] = false;
          } else {
            initialFormValues[props.name] = '';
          }
        }
      });
      
      setFormValues(initialFormValues);
      setIsFormValid(true);

      // Load volunteer hours for the selected user
      if (userType === UserTypes.Volunteers) {
        await loadVolunteerHours(userId);
      }

      // Load linked email accounts
      await loadLinkedEmails(userId);
    }
  };

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSwitchChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      [name]: event.target.checked,
    });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!selectedUserId) return;

    // Filter out empty values and only include fields from UserFormSchema
    let filledData = Object.keys(formValues).reduce((obj, key) => {
      if (formValues[key] !== '' && formValues[key] !== null && formValues[key] !== undefined) {
        obj[key] = formValues[key];
      }
      return obj;
    }, {} as Record<string, any>);

    const authToken = await getAccessTokenSilently();
    const res = await putUserData(authToken, selectedUserId, filledData, userType);
    
    if (res.error) {
      setErrorStatus(true);
    } else {
      setSuccessStatus(true);
      // Reload users data to get updated information
      await loadUsersList();
      
      // Refresh the selected user's data to show updated information
      if (selectedUserId) {
        const updatedUserData = await loadFullUserData(selectedUserId);
        if (updatedUserData) {
          setSelectedUserData(updatedUserData);
        }
      }
    }
  };

  // Handle volunteer hours click
  const handleHoursClick = (hoursData: VolunteerHoursData) => {
    setSelectedHoursData(hoursData);
    setHoursUpdateOpen(true);
  };

  const handleEmailClick = (emailData: any) => {
    setSelectedEmailData(emailData);
    setEmailUpdateOpen(true);
  };

  // Handle volunteer hours update
  const handleHoursUpdate = async () => {
    if (selectedUserId) {
      await loadVolunteerHours(selectedUserId);
    }
  };

  // Handle email update
  const handleEmailUpdate = async () => {
    // This will be called by the EmailAccountUpdate component
  };

  // Handle mode change
  const handleModeChange = (event: React.MouseEvent<HTMLElement>, newMode: 'view' | 'update' | null) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  // Handle volunteer hours success
  const handleHoursSuccess = () => {
    setSuccessStatus(true);
    // Refresh volunteer hours
    if (selectedUserId) {
      loadVolunteerHours(selectedUserId);
      // Also refresh user data to update total hours and bonus hours
      loadFullUserData(selectedUserId).then((updatedUserData) => {
        if (updatedUserData) {
          setSelectedUserData(updatedUserData);
        }
      });
    }
  };

  // Handle volunteer hours error
  const handleHoursError = () => {
    setErrorStatus(true);
  };

  const handleEmailSuccess = () => {
    setSuccessStatus(true);
    // Refresh linked emails
    if (selectedUserId) {
      loadLinkedEmails(selectedUserId);
    }
  };

  const handleEmailError = () => {
    setErrorStatus(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUserId) {
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedUserData?.first_name} ${selectedUserData?.last_name}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    const authToken = await getAccessTokenSilently();
    const res = await deleteUserData(authToken, selectedUserId, userType);
    
    if (!res.error) {
      setSuccessStatus(true);
      // Clear selection and refresh user list
      setSelectedUserId(null);
      setSelectedUserData(null);
      setFormValues({});
      setIsFormValid(false);
      setUserVolunteerHours([]);
      setUserLinkedEmails([]);
      await loadUsersList();
    } else {
      setErrorStatus(true);
    }
  };

  useEffect(() => {
    loadUsersList();
  }, [showActiveOnly]);

  const scrollListProps: ScrollListProps = {
    initialItemList: nameList,
    handleOptionClick: handleOptionClick
  };

  const renderFormField = ({ key, isRequired, props }: any) => {
    if (props.type === 'boolean') {
      return (
        <FormControlLabel
          key={key}
          control={
            <Switch
              checked={formValues[props.name] || false}
              onChange={handleSwitchChange(props.name)}
              name={props.name}
            />
          }
          label={props.label}
        />
      );
    } else {
      return (
        <TextField
          key={key}
          required={isRequired}
          name={props.name}
          label={props.label}
          type={props.type}
          value={formValues[props.name] || ''}
          onChange={handleInputChange}
          InputLabelProps={props.type === "date" ? { shrink: true } : undefined}
          fullWidth
        />
      );
    }
  };

  const HoursTable = ({ clickable }: { clickable?: boolean }) => (
    <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell><b>Service Date</b></TableCell>
            <TableCell><b>Type</b></TableCell>
            <TableCell><b>Hours</b></TableCell>
            <TableCell><b>Description</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {userVolunteerHours.map((item) => (
            <TableRow
              key={item.id}
              hover={clickable}
              onClick={clickable ? () => handleHoursClick(item) : undefined}
              sx={clickable ? { cursor: 'pointer' } : undefined}
            >
              <TableCell>{new Date(item.service_date).toLocaleDateString()}</TableCell>
              <TableCell>{item.service_type}</TableCell>
              <TableCell>{item.hours}</TableCell>
              <TableCell>{item.description || ''}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const EmailsTable = ({ clickable }: { clickable?: boolean }) => (
    <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell><b>Email</b></TableCell>
            <TableCell><b>Display Name</b></TableCell>
            <TableCell><b>Created</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {userLinkedEmails.map((item) => (
            <TableRow
              key={item.id}
              hover={clickable}
              onClick={clickable ? () => handleEmailClick(item) : undefined}
              sx={clickable ? { cursor: 'pointer' } : undefined}
            >
              <TableCell>{item.email}</TableCell>
              <TableCell>{item.display_name}</TableCell>
              <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <>
      <AlertToaster
        {...alertProps}
        successMessage="User operation completed successfully!"
        errorMessage="Failed to update user. Please try again."
      />
      
      <SearchScrollList {...scrollListProps} />
      
      {selectedUserData && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            {selectedUserData.first_name} {selectedUserData.last_name}
          </Typography>
          
          {/* View/Update Mode Toggle */}
          <Box sx={{ mb: 2 }}>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={handleModeChange}
              aria-label="view or update mode"
            >
              <ToggleButton value="view" aria-label="view mode">
                View
              </ToggleButton>
              <ToggleButton value="update" aria-label="update mode">
                Update
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          
          {/* View Mode */}
          {mode === 'view' && (
            <>
              {/* User Data Accordion */}
              <Accordion defaultExpanded={false} sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    User Information
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="h6" sx={{ textDecoration: 'underline' }} gutterBottom>
                    User Data: 
                  </Typography>
                  <div>
                    { selectedUserData && Object.keys(selectedUserData).map((key) => (
                      // @ts-ignore for now
                      <p key={uuid()}>{key}: {selectedUserData[key] && renderField(key, selectedUserData[key])}</p> // Convert to string for bools
                    ))}
                  </div>
                </AccordionDetails>
              </Accordion>
              
              {/* Volunteer Hours Section */}
              {userType === UserTypes.Volunteers && userVolunteerHours.length !== 0 && (
                <Accordion defaultExpanded={false} sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Volunteer Hours
                      {selectedUserData && (
                        <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                          (Total: {selectedUserData.hours}{selectedUserData.bonus_hours > 0 ? ` = ${selectedUserData.hours - selectedUserData.bonus_hours} + ${selectedUserData.bonus_hours} bonus` : ''})
                        </Typography>
                      )}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <HoursTable />
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Linked Email Accounts Section */}
              {userLinkedEmails.length !== 0 && (
                <Accordion defaultExpanded={false} sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Linked Email Accounts
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <EmailsTable />
                  </AccordionDetails>
                </Accordion>
              )}
            </>
          )}
          
          {/* Update Mode */}
          {mode === 'update' && (
            <>
              {/* User Update Form Accordion */}
              <Accordion defaultExpanded={false} sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    User Information
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <form onSubmit={handleSubmit}>
                    <FormControl fullWidth>
                      <Stack spacing={2}>
                        {UserFormSchema.map(renderFormField)}
                      </Stack>
                    </FormControl>
                    
                    <Box sx={{ mt: 3 }}>
                      <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={!isFormValid}
                        sx={{ mr: 2 }}
                      >
                        Update User
                      </Button>
                      <Button 
                        variant="outlined" 
                        onClick={() => {
                          setSelectedUserId(null);
                          setSelectedUserData(null);
                          setFormValues({});
                          setIsFormValid(false);
                          setUserVolunteerHours([]);
                        }}
                      >
                        Clear Selection
                      </Button>
                    </Box>
                  </form>
                </AccordionDetails>
              </Accordion>

              {/* Volunteer Hours Accordion */}
              {userType === UserTypes.Volunteers && userVolunteerHours.length !== 0 && (
                <Accordion defaultExpanded={false} sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Volunteer Hours - Click to Update
                      {selectedUserData && (
                        <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                          (Total: {selectedUserData.hours}{selectedUserData.bonus_hours > 0 ? ` = ${selectedUserData.hours - selectedUserData.bonus_hours} + ${selectedUserData.bonus_hours} bonus` : ''})
                        </Typography>
                      )}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <HoursTable clickable />
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Linked Email Accounts Accordion */}
              {userLinkedEmails.length !== 0 && (
                <Accordion defaultExpanded={false} sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Linked Email Accounts - Click to Update
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <EmailsTable clickable />
                  </AccordionDetails>
                </Accordion>
              )}
            </>
          )}

          {/* Delete User Button - Always visible when user is selected */}
          <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button 
              variant="outlined" 
              color="error"
              onClick={handleDeleteUser}
              sx={{ 
                borderColor: 'error.main',
                color: 'error.main',
                '&:hover': {
                  borderColor: 'error.dark',
                  backgroundColor: 'error.light',
                  color: 'error.contrastText'
                }
              }}
            >
              Delete User
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This will permanently delete the user but not all associated data (e.g. volunteer hours and email account links).
            </Typography>
          </Box>
        </Box>
      )}
      
      {!selectedUserData && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Select a user from the list above to update their information.
          </Typography>
        </Box>
      )}

      {/* Volunteer Hours Update Dialog */}
      <VolunteerHoursUpdate
        hoursData={selectedHoursData}
        open={hoursUpdateOpen}
        onClose={() => {
          setHoursUpdateOpen(false);
          setSelectedHoursData(null);
        }}
        onUpdate={handleHoursUpdate}
        onSuccess={handleHoursSuccess}
        onError={handleHoursError}
      />

      {/* Email Account Update Dialog */}
      <EmailAccountUpdate
        emailData={selectedEmailData}
        open={emailUpdateOpen}
        onClose={() => {
          setEmailUpdateOpen(false);
          setSelectedEmailData(null);
        }}
        onUpdate={handleEmailUpdate}
        onSuccess={handleEmailSuccess}
        onError={handleEmailError}
      />
    </>
  );
} 