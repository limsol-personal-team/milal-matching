import { Box, TextField, Typography, List, ListItem, ListItemText, Paper, ToggleButton, ToggleButtonGroup, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getMatchData } from '../utils/serverFunctions';
import { MatchData, MilalFriendData } from '../types/modelSchema';
import AlertToaster from './AlertToaster';
import { getCurrentDateTimeISO } from '../utils/dateTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DateRangeIcon from '@mui/icons-material/DateRange';

// View mode types
type ViewMode = 'daily' | 'range';

// Common styles for consistency
const commonPaperStyles = {
  mt: 1, 
  p: 1, 
  flexGrow: 1, 
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  width: '100%', // Ensure consistent width
};

// Reduce the list height to ensure it fits on mobile screens
const commonListStyles = {
  overflow: 'auto', 
  maxHeight: '45vh', // Smaller percentage to ensure it fits on mobile
  width: '100%', // Ensure consistent width
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(0,0,0,.2)',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'rgba(0,0,0,.05)',
  }
};

export default function AttendanceCalendar() {
  const { getAccessTokenSilently } = useAuth0();
  
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  
  // Daily view states
  const [selectedDate, setSelectedDate] = useState(getCurrentDateTimeISO(true));
  const [attendanceData, setAttendanceData] = useState<MatchData[]>([]);
  
  // Date range view states
  const [startDate, setStartDate] = useState(getCurrentDateTimeISO(true));
  const [endDate, setEndDate] = useState(getCurrentDateTimeISO(true));
  const [rangeAttendanceData, setRangeAttendanceData] = useState<MatchData[]>([]);
  
  // Alert states
  const [errorStatus, setErrorStatus] = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);
  const alertProps = { errorStatus, setErrorStatus, successStatus, setSuccessStatus };

  // Fetch attendance data when the date changes in daily view
  useEffect(() => {
    if (viewMode === 'daily' && selectedDate) {
      fetchAttendanceData(selectedDate);
    }
  }, [selectedDate, viewMode]);

  // Fetch attendance data when date range changes
  useEffect(() => {
    if (viewMode === 'range' && startDate && endDate) {
      fetchRangeAttendanceData(startDate, endDate);
    }
  }, [startDate, endDate, viewMode]);

  const fetchAttendanceData = async (date: string) => {
    try {
      const authToken = await getAccessTokenSilently();
      const queryString = `match_date=${date}`;
      const res = await getMatchData(authToken, queryString);
      
      if (!res.error) {
        setAttendanceData(res.data);
        setSuccessStatus(true);
      } else {
        setErrorStatus(true);
      }
    } catch (error) {
      setErrorStatus(true);
      console.error('Error fetching attendance data:', error);
    }
  };

  const fetchRangeAttendanceData = async (start: string, end: string) => {
    try {
      const authToken = await getAccessTokenSilently();
      const queryString = `match_date__gte=${start}&match_date__lte=${end}`;
      const res = await getMatchData(authToken, queryString);
      
      if (!res.error) {
        setRangeAttendanceData(res.data);
        setSuccessStatus(true);
      } else {
        setErrorStatus(true);
      }
    } catch (error) {
      setErrorStatus(true);
      console.error('Error fetching range attendance data:', error);
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null,
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // Function to get unique Milal Friends from the attendance data and sort them alphabetically
  const getUniqueMilalFriends = () => {
    const uniqueMilalFriends = new Map();
    
    attendanceData.forEach((match) => {
      if (match.milal_friend) {
        uniqueMilalFriends.set(match.milal_friend.id, match.milal_friend);
      }
    });
    
    // Convert to array and sort alphabetically by first name, then last name
    return Array.from(uniqueMilalFriends.values())
      .sort((a, b) => {
        // First compare by first name
        const firstNameComparison = a.first_name.localeCompare(b.first_name);
        // If first names are the same, compare by last name
        return firstNameComparison !== 0 ? firstNameComparison : a.last_name.localeCompare(b.last_name);
      });
  };

  // Function to get unique Milal Friends with their attendance dates from the range data
  const getUniqueMilalFriendsWithDates = () => {
    // Create a map of Milal Friend IDs to an object containing the friend and their attendance dates
    const friendsWithDates = new Map<string, { friend: MilalFriendData, dates: Set<string> }>();
    
    rangeAttendanceData.forEach((match) => {
      if (match.milal_friend && match.match_date) {
        const friendId = match.milal_friend.id;
        
        if (!friendsWithDates.has(friendId)) {
          friendsWithDates.set(friendId, {
            friend: match.milal_friend,
            dates: new Set<string>()
          });
        }
        
        // Add the date to the set of dates for this friend
        friendsWithDates.get(friendId)?.dates.add(match.match_date);
      }
    });
    
    // Convert to array and sort alphabetically
    return Array.from(friendsWithDates.values())
      .sort((a, b) => {
        const firstNameComparison = a.friend.first_name.localeCompare(b.friend.first_name);
        return firstNameComparison !== 0 ? firstNameComparison : a.friend.last_name.localeCompare(b.friend.last_name);
      });
  };

  // Function to format the matched volunteer names without redundant text
  const formatMatchedVolunteers = (friend: MilalFriendData) => {
    const matchedVolunteers = attendanceData
      .filter(match => match.milal_friend?.id === friend.id && match.volunteer)
      .map(match => `${match.volunteer?.first_name} ${match.volunteer?.last_name}`);
      
    if (matchedVolunteers.length === 0) {
      return 'Self-matched';
    } else {
      return `Matched with: ${matchedVolunteers.join(', ')}`;
    }
  };

  // Function to format dates in MM/DD format with proper timezone handling
  const formatSimpleDate = (dateStr: string): string => {
    // Split the date string and create a date object with explicit parts to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    
    // Month is already 1-indexed in the ISO string format (YYYY-MM-DD)
    return `${month}/${day}`;
  };

  // Sort dates in ascending order
  const sortDates = (dates: string[]): string[] => {
    return [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  };

  const uniqueFriends = getUniqueMilalFriends();
  const friendsWithDates = getUniqueMilalFriendsWithDates();

  return (
    <Box sx={{ 
      p: 0, 
      display: 'flex', 
      flexDirection: 'column', 
      width: '100%', 
      overflow: 'hidden',
      maxWidth: '100%', // Prevent horizontal expansion
    }}>
      <AlertToaster
        {...alertProps}
        successMessage="Attendance data loaded"
        errorMessage="Error loading attendance data"
      />
      
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        mb: 2,
        width: '100%',
      }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="attendance view mode"
          size="small"
        >
          <ToggleButton value="daily" aria-label="daily view">
            <CalendarMonthIcon sx={{ mr: 1 }} />
            Daily View
          </ToggleButton>
          <ToggleButton value="range" aria-label="range view">
            <DateRangeIcon sx={{ mr: 1 }} />
            Date Range
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      <Box sx={{ 
        width: '100%'
      }}>
        {viewMode === 'daily' ? (
          // Daily View
          <>
            <TextField
              label="Select Date"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
            
            <Paper elevation={2} sx={commonPaperStyles}>
              {uniqueFriends.length > 0 ? (
                <List sx={commonListStyles}>
                  {uniqueFriends.map((friend) => (
                    <ListItem key={friend.id}>
                      <ListItemText
                        primary={`${friend.first_name} ${friend.last_name}`}
                        secondary={formatMatchedVolunteers(friend)}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
                  No Milal Friends were present on this date.
                </Typography>
              )}
            </Paper>
          </>
        ) : (
          // Date Range View
          <>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              width: '100%',
            }}>
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
            
            <Paper elevation={2} sx={commonPaperStyles}>
              {friendsWithDates.length > 0 ? (
                <List sx={commonListStyles}>
                  {friendsWithDates.map(({ friend, dates }) => (
                    <ListItem key={friend.id}>
                      <ListItemText
                        primary={`${friend.first_name} ${friend.last_name}`}
                        secondary={
                          <Box sx={{ 
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            width: '100%'
                          }}>
                            Days attended: {sortDates(Array.from(dates)).map(date => formatSimpleDate(date)).join(', ')}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
                  No Milal Friends were present in this date range.
                </Typography>
              )}
            </Paper>
          </>
        )}
      </Box>
    </Box>
  );
} 