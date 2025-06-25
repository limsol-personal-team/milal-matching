import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import UserDetail from '../components/UserDetail';
import UserCreate from '../components/UserCreate';
import AttendanceCalendar from '../components/AttendanceCalendar';
import { UserTypes } from '../utils/constants';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function MilalFriendPage() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Create" {...a11yProps(0)} />
          <Tab label="Detail" {...a11yProps(1)} />
          <Tab label="Attendance" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <UserCreate userType={UserTypes.MilalFriends}/>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <UserDetail userType={UserTypes.MilalFriends}/>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <AttendanceCalendar />
      </CustomTabPanel>
    </Box>
  );
}