import * as React from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Logout from "@mui/icons-material/Logout";

interface AccountMenuProps {
  name: string;
  email: string;
  profilePic?: string | null;
  onLogout: () => void;
}

const AccountMenu: React.FC<AccountMenuProps> = ({
  name,
  email,
  profilePic,
  onLogout,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 1 }}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Avatar
              src={profilePic || undefined}
              sx={{ width: 36, height: 36 }}
            >
              {!profilePic && name?.charAt(0)}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 2,
            sx: {
              mt: 1.5,
              overflow: "visible",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                right: 16,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {email}
          </Typography>
        </Box>

        <Divider />



        {/* Logout */}
        <MenuItem
          onClick={() => {
            handleClose();
            onLogout();
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default AccountMenu;
