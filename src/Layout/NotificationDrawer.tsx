import { Drawer, Divider, CircularProgress, Typography } from "@mui/material";
import axios from "axios";
import { BASE_URL } from "../config/config";
import useInvitation from "../hooks/useInviation";
// import useInvitation, { Invite } from ;

interface NotificationsDrawerProps {
  notificationOpen: boolean;
  setNotificationOpen: (open: boolean) => void;
  userId: string;
  refreshInvites?: () => void;
}

export default function NotificationsDrawer({
  notificationOpen,
  setNotificationOpen,
  userId,
  refreshInvites,
}: NotificationsDrawerProps) {
  const { data, isLoading, isError } = useInvitation({ userId });

  const handleInviteResponse = async (
    inviteId: string,
    action: "accept" | "reject",
    sectionId: string
  ) => {
    try {
      await axios.post(
        `${BASE_URL}/api/data/invites/respond`,
        { inviteId, accept: action === "accept", section: sectionId },
        { withCredentials: true }
      );

      // Optional: trigger a refetch
      window.location.reload();
      if (refreshInvites) refreshInvites();
    } catch (err) {
      console.error("Error responding to invite:", err);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={notificationOpen}
      onClose={() => setNotificationOpen(false)}
    >
      <div className="w-80 p-4">
        <h2 className="text-lg font-semibold mb-2">Notifications</h2>
        <Divider className="mb-2" />

        {/* Loader */}
        {isLoading && (
          <div className="flex justify-center items-center mt-10">
            <CircularProgress size={28} />
          </div>
        )}

        {/* Error */}
        {isError && (
          <Typography color="error" className="text-sm text-center mt-4">
            Failed to load invites.
          </Typography>
        )}

        {/* Data */}
        {!isLoading && !isError && (
          <ul className="space-y-4 mt-3">
            {data?.length ? (
              data.map((invite: any) => (
                <div
                  key={invite._id}
                  className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border"
                >
                  <div className="text-sm">
                    <p className="font-medium">
                      {invite.invitedBy?.name} invited you to join a group
                    </p>
                    <p className="text-xs text-gray-500">
                      Role: {invite.role} ·{" "}
                      {new Date(invite.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleInviteResponse(invite._id, "accept", invite.sectionId)
                      }
                      className="px-2 py-1 text-xs rounded-lg bg-green-500 text-white hover:bg-green-600"
                    >
                      ✅
                    </button>
                    <button
                      onClick={() =>
                        handleInviteResponse(invite._id, "reject", invite.sectionId)
                      }
                      className="px-2 py-1 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600"
                    >
                      X
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <li className="text-sm text-gray-500 text-center">
                No pending invites
              </li>
            )}
          </ul>
        )}
      </div>
    </Drawer>
  );
}
