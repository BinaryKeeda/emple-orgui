import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Logout,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import {
  Tooltip,
  Button,
  Typography,
  IconButton,
  Skeleton,
  Box,
  Badge,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { BASE_URL, LOGO } from "../config/config";
import { useLogout } from "../hooks/useLogout";
import type { RootState } from "../store/store";
import NotificationsDrawer from "../Layout/NotificationDrawer";
import useInvitation from "../hooks/useInviation";

/* --------------------------- Section Card --------------------------- */
const SectionCard = ({
  section,
  // onDelete,
}: {
  section: { _id: string; name: string; logo: string };
  onDelete: () => void;
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative flex flex-col rounded-xl bg-white text-gray-700 shadow-md hover:shadow-lg transition-transform hover:scale-[1.02]">
      {/* Logo */}
      <div className="relative h-40 flex items-center justify-center bg-gradient-to-r rounded-t-xl overflow-hidden">
        {!imgLoaded && section.logo && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
            <Typography variant="body2" color="textSecondary">
              Loading...
            </Typography>
          </div>
        )}
        {section.logo ? (
          <img
            src={section.logo}
            alt={section.name}
            className="h-full w-full object-cover"
            onLoad={() => setImgLoaded(true)}
          />
        ) : (
          <Typography variant="h4" className="text-gray-900 font-bold">
            {section.name[0]}
          </Typography>
        )}

        {/* Delete Button */}

      </div>

      {/* Title */}
      <div className="px-6 pt-4 pb-2 text-center">
        <Typography variant="h6" className="font-semibold">
          {section.name}
        </Typography>
      </div>

      {/* Action */}
      <div className="flex justify-center pb-4">
        <Button
          onClick={() => {
            localStorage.setItem("sectionId", section._id);
            navigate("section/" + section._id);
          }}
          endIcon={<ArrowRight />}
          sx={{
            px: 3,
            py: 1,
            fontSize: 12,
            background: "linear-gradient(90deg, #007BFF 0%, #004A99 100%)",
            color: "#fff",
            borderRadius: 2,
          }}
        >
          Proceed
        </Button>
      </div>
    </div>
  );
};

/* --------------------------- SectionCard Skeleton --------------------------- */
const SectionSkeleton = () => (
  <Box className="flex flex-col rounded-xl bg-white shadow-md p-4">
    <Skeleton variant="rectangular" height={150} animation="wave" />
    <Skeleton variant="text" width="80%" sx={{ mt: 2, mx: "auto" }} />
    <Skeleton
      variant="rectangular"
      width="50%"
      height={36}
      sx={{ mt: 2, mx: "auto", borderRadius: 1 }}
    />
  </Box>
);

/* ------------------------------- Dashboard ------------------------------ */
const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const logout = useLogout();
  const { enqueueSnackbar } = useSnackbar();
  const user = useSelector((s: RootState) => s.auth.user);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleDelete = async (ownershipId: string) => {
    setSelectedId(ownershipId);
    setConfirmOpen(true);
  };
  const { data } = useInvitation({ userId:user?.user._id  as string});
  const confirmDelete = async () => {
    if (!selectedId) return;

    try {
      await axios.post(
        `${BASE_URL}/api/campus/delete/section/${selectedId}`,
        {},
        { withCredentials: true }
      );
      enqueueSnackbar("Section deleted successfully!", {
        variant: "success",
        autoHideDuration: 2500,
      });
      // Optionally refresh page or remove deleted section from state
    } catch (err: any) {
      enqueueSnackbar("Failed to delete section!", {
        variant: "error",
        autoHideDuration: 2500,
      });
      console.error(err);
    } finally {
      setConfirmOpen(false);
      setSelectedId(null);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="p-2 border-b border-b-[#e1e1e1] flex gap-3 items-center justify-between px-5">
        <img src={LOGO} className="h-10" alt="Logo" />
        <div className="flex gap-4 items-center">
          {/* Notifications */}
          <Tooltip title="Notifications" arrow>
            <IconButton
              size="small"
              sx={{ color: "#1976d2" }}
              onClick={() => setNotificationOpen(true)}
            ><Badge
              color="error"
              invisible={data?.length === 0} // hide badge when count is 0
            >
                <NotificationsIcon />
                <span className="text-xs w-4  rounded-full bg-red-500 text-white h-4 ">{data?.length}</span>
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Logout */}
          <Tooltip title="Logout" arrow>
            <IconButton onClick={logout} size="small" sx={{ color: "#f44336" }}>
              <Logout sx={{ cursor: "pointer" }} />
            </IconButton>
          </Tooltip>
        </div>
      </header>

      {/* Notifications Drawer */}
      {user?.user?._id && (
        <NotificationsDrawer
          notificationOpen={notificationOpen}
          setNotificationOpen={setNotificationOpen}
          userId={user.user?._id}
        />
      )}

      {/* Main Section Grid */}
      {loading ? (
        <div className="grid grid-cols-1 p-5 mt-4 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <SectionSkeleton key={i} />
          ))}
        </div>
      ) : Array.isArray(user?.ownership) && user.ownership.length ? (
        <div className="grid grid-cols-1 p-5 mt-4 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {user.ownership.map((o: any) => (
            <SectionCard
              key={o.section?._id}
              section={o.section}
              onDelete={() => handleDelete(o._id)}
            />
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
          <Typography variant="body1" gutterBottom>
            Admin, no sections have been created yet.
          </Typography>
          <Typography variant="body2">
            Ask your admin to create sections.
          </Typography>
        </div>
      )}

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this section? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Dashboard;
