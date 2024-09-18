import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import Toolbar from "@mui/material/Toolbar";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddHomeIcon from "@mui/icons-material/AddHome";
import SummarizeIcon from "@mui/icons-material/Summarize";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import AssistantIcon from '@mui/icons-material/Assistant';
import { useRouter } from "next/navigation";

const routes = [
  {
    name: "Dashboard",
    href: "/",
    icon: <DashboardIcon />,
  },
  {
    name: "Pipeline",
    href: "/pipeline",
    icon: <SelectAllIcon />,
  },
  {
    name: "Claims",
    href: "/claims",
    icon: <SummarizeIcon />,
  },
  {
    name: "Add Property",
    href: "/property",
    icon: <AddHomeIcon />,
  },
  // {
  //   name: "Entity Information",
  //   href: "/entity",
  //   icon: <CorporateFareIcon />,
  // },
  {
    name: "Neuro 3d Demo",
    href: "/neuro3d",
    icon: <AssistantIcon />,
  },
];

export default function SideNavBar({ open, toggleDrawer }: { open: boolean; toggleDrawer: (open: boolean) => void }) {
  const router = useRouter();

  const handleClick = (href: string) => {
    router.push(href);
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={() => toggleDrawer(false)}>
      <List>
        {routes.map((route, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton onClick={() => handleClick(route.href)}>
              <ListItemIcon>{route.icon}</ListItemIcon>
              <ListItemText primary={route.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer open={open} onClose={() => toggleDrawer(false)}>
      <Toolbar />
      {DrawerList}
    </Drawer>
  );
}
