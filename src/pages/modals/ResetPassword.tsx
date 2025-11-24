import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    IconButton,
    InputAdornment,
    CircularProgress,
    Box,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { BASE_URL } from "../../config/config";
import axios from "axios";
import { useSnackbar } from "notistack";

type Props = {
    open: boolean;
    onClose: () => void;
    onReset?: (payload: { oldPassword: string; newPassword: string }) => Promise<any>;
};

export default function ResetPasswordModal({ open, onClose, onReset }: Props) {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const { enqueueSnackbar } = useSnackbar();

    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading] = useState(false);

    const validate = () => {

        if (!oldPassword) return "Please enter your current password.";
        if (!newPassword) return "Please enter a new password.";
        if (newPassword.length < 8) return "New password must be at least 8 characters.";
        if (newPassword === oldPassword) return "New password must be different from old password.";
        if (!confirmPassword) return "Please confirm your new password.";
        if (newPassword !== confirmPassword) return "New password and confirm password do not match.";

        return null;
    };

    const passwordsDontMatch =
        confirmPassword.length > 0 && confirmPassword !== newPassword;

    const disableSubmit =
        !oldPassword ||
        !newPassword ||
        newPassword.length < 8 ||
        passwordsDontMatch ||
        loading;

    const handleSubmit = async () => {
        const v = validate();
        if (v) {
            return;
        }

        setLoading(true);

        try {
            if (onReset) {
                await onReset({ oldPassword, newPassword });
            } else {
                try {
                    await axios.post(`${BASE_URL}/auth/reset/password`, { oldPassword, newPassword }, { withCredentials: true });
                    enqueueSnackbar("Password changed successfully.", { variant: "success" });
                } catch (err: any) {
                    if (err.response && err.response.data && err.response.data.message) {
                        enqueueSnackbar(err.response.data.message, { variant: "error" });
                        throw new Error(err.response.data.message);
                    }
                }
            }
        } catch (err: any) {
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle>Reset password</DialogTitle>

            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} mt={1}>
                    {/* Old Password */}
                    <TextField
                        label="Current password"
                        type={showOld ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        fullWidth
                        autoFocus
                        disabled={loading}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowOld(s => !s)} edge="end" size="large">
                                        {showOld ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* New Password */}
                    <TextField
                        label="New password"
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        fullWidth
                        disabled={loading}
                        helperText="Minimum 8 characters"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowNew(s => !s)} edge="end" size="large">
                                        {showNew ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* Confirm Password */}
                    <TextField
                        label="Confirm new password"
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        fullWidth
                        disabled={loading}
                        error={passwordsDontMatch}
                        helperText={passwordsDontMatch ? "Passwords do not match" : ""}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowConfirm(s => !s)} edge="end" size="large">
                                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                 
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={disableSubmit}
                    startIcon={loading ? <CircularProgress size={18} /> : null}
                >
                    Reset password
                </Button>
            </DialogActions>
        </Dialog>
    );
}
