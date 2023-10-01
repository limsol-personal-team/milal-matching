import AssignmentIcon from "@mui/icons-material/Assignment";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer, { DrawerProps } from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import * as React from "react";
import { NavLink } from "react-router-dom";

const categories = [
  {
    id: "Pages",
    children: [
      {
        id: "Users",
        slug: "users",
        icon: <PeopleIcon />,
      },
      {
        id: "Hours",
        slug: "volunteer-hours",
        icon: <AccessTimeFilledIcon />,
      },
      {
        id: "Check-In QR",
        slug: "checkin-qr",
        icon: <AssignmentIcon />,
      },
    ],
  },
  {
    id: "Contact",
    children: [
      {
        id: "Contact",
        slug: "contact",
        icon: <SettingsIcon />,
      },
    ],
  },
];

const item = {
  py: "2px",
  px: 3,
  color: "rgba(255, 255, 255, 0.7)",
  "&:hover, &:focus": {
    bgcolor: "rgba(255, 255, 255, 0.08)",
  },
};

const itemCategory = {
  boxShadow: "0 -1px 0 rgb(255,255,255,0.1) inset",
  py: 1.5,
  px: 3,
};

export default function Navigator(props: DrawerProps) {
  const { ...other } = props;

  return (
    <Drawer variant="permanent" {...other}>
      <List disablePadding>
        <ListItem
          sx={{ ...item, ...itemCategory, fontSize: 22, color: "#fff" }}
        >
          Milal Ops
        </ListItem>
        <Box sx={{}}>
          <ListItem disablePadding sx={{ py: 1 }}>
            <ListItemButton
              sx={item}
              component={NavLink}
              to={"home"}
              // @ts-ignore for now
              onClick={props.onClose}
            >
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText>Home</ListItemText>
            </ListItemButton>
          </ListItem>
        </Box>
        {categories.map(({ id, children }) => (
          <Box key={id} sx={{ bgcolor: "#101F33" }}>
            <ListItem sx={{ py: 2, px: 3 }}>
              <ListItemText sx={{ color: "#fff" }}>{id}</ListItemText>
            </ListItem>
            {children.map(({ id: childId, slug, icon }) => (
              <ListItem disablePadding key={childId}>
                <ListItemButton
                  sx={item}
                  component={NavLink}
                  to={slug}
                  // @ts-ignore for now
                  onClick={props.onClose}
                >
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText>{childId}</ListItemText>
                </ListItemButton>
              </ListItem>
            ))}
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}
      </List>
    </Drawer>
  );
}
