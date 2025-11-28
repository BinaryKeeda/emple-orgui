import  { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Typography,
    MenuItem,
    Box,
} from "@mui/material";
    import { Edit, Delete } from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { useSnackbar } from "notistack";

// -------------------------------------------
// TYPES
// -------------------------------------------
type Field = {
    key: string;
    label: string;
    type: string;
    options: string[];
};

export default function UserDetailsModal({
    open,
    onClose,
    examId,
    userDetails,
    refresh,
}: {
    open: boolean;
    onClose: () => void;
    examId: string;
    userDetails: Field[];
    refresh: () => void;
}) {

    const  { enqueueSnackbar } = useSnackbar();
    const [newField, setNewField] = useState<Field>({
        key: "",
        label: "",
        type: "text",
        options: [],
    });

    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editField, setEditField] = useState<Field | null>(null);

    // Auto-generate keys
    const slugify = (str: string) =>
        str
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, "");

    // -------------------------------------------
    // ADD FIELD
    // -------------------------------------------
    const addFieldHandler = async () => {
        try {
            await axios.post(
                `${BASE_URL}/api/campus/section/${examId}/user-details/add`,
                { field: newField }
            );

            refresh();
            setNewField({ key: "", label: "", type: "text", options: [] });
            enqueueSnackbar({ message: "Field added successfully", variant: "success" });
        } catch (err) {
            enqueueSnackbar({ message: "Error adding field", variant: "error" });
            console.log(err);
        }
    };

    // -------------------------------------------
    // UPDATE FIELD
    // -------------------------------------------
    const updateFieldHandler = async () => {
        if (editField === null || editIndex === null) return;

        try {
            await axios.put(
                `${BASE_URL}/api/campus/section/${examId}/user-details/${editIndex}`,
                { field: editField }
            );

            refresh();
            setEditIndex(null);
            setEditField(null);
            enqueueSnackbar({ message: "Field updated successfully", variant: "success" });
        } catch (err) {
            enqueueSnackbar({ message: "Error updating field", variant: "error" }); 
            console.log(err);
        }
    };

    // -------------------------------------------
    // DELETE FIELD
    // -------------------------------------------
    const deleteFieldHandler = async (index: number) => {
        try {
            await axios.delete(
                `${BASE_URL}/api/campus/section/${examId}/user-details/${index}`
            );
            enqueueSnackbar({ message: "Field deleted successfully", variant: "success" });
            refresh();
        } catch (err) {
            console.log(err);
        }
    };

    const fieldTypes = ["text", "email", "number", "select"];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>User Details Fields</DialogTitle>

            <DialogContent dividers>
                {/* LIST EXISTING FIELDS */}
                <Typography variant="subtitle1" mb={1}>
                    Existing Fields:
                </Typography>

                <List dense>
                    {userDetails?.map((field, index) => (
                        <ListItem
                            key={index}
                            sx={{
                                border: "1px solid #ddd",
                                borderRadius: 2,
                                mb: 1,
                                px: 1.5,
                            }}
                        >
                            <ListItemText
                                primary={`${field.label} (${field.type})`}
                                secondary={
                                    field.type === "select"
                                        ? `Options: ${field.options.join(", ")}`
                                        : ""
                                }
                            />

                            <ListItemSecondaryAction>
                                <IconButton
                                    onClick={() => {
                                        setEditIndex(index);
                                        setEditField(field);
                                    }}
                                >
                                    <Edit />
                                </IconButton>

                                <IconButton onClick={() => deleteFieldHandler(index)}>
                                    <Delete />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>

                {/* ADD NEW FIELD */}
                <Typography variant="subtitle1" mt={3}>
                    Add New Field
                </Typography>

                <Box mt={1}>
                    {/* LABEL */}
                    <TextField
                        size="small"
                        label="Label"
                        fullWidth
                        margin="dense"
                        value={newField.label}
                        onChange={(e) => {
                            const label = e.target.value;
                            setNewField((prev) => ({
                                ...prev,
                                label,
                                key: slugify(label),
                            }));
                        }}
                    />

                    {/* TYPE */}
                    <TextField
                        size="small"
                        label="Type"
                        select
                        fullWidth
                        margin="dense"
                        value={newField.type}
                        onChange={(e) =>
                            setNewField((prev) => ({ ...prev, type: e.target.value }))
                        }
                    >
                        {fieldTypes.map((t) => (
                            <MenuItem key={t} value={t}>
                                {t}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* OPTIONS (only for select) */}
                    {newField.type === "select" && (
                        <TextField
                            size="small"
                            label="Options (comma separated)"
                            fullWidth
                            margin="dense"
                            value={newField.options.join(",")}
                            onChange={(e) =>
                                setNewField((prev) => ({
                                    ...prev,
                                    options: e.target.value.split(","),
                                }))
                            }
                        />
                    )}

                    <Button
                        sx={{ mt: 1 }}
                        variant="contained"
                        fullWidth
                        onClick={addFieldHandler}
                    >
                        Add Field
                    </Button>
                </Box>

                {/* EDIT FIELD */}
                {editField && (
                    <>
                        <Typography variant="subtitle1" mt={4}>
                            Edit Field
                        </Typography>

                        <Box mt={1}>
                            {/* LABEL */}
                            <TextField
                                size="small"
                                label="Label"
                                fullWidth
                                margin="dense"
                                value={editField.label}
                                onChange={(e) => {
                                    const label = e.target.value;
                                    setEditField((prev) => ({
                                        ...prev!,
                                        label,
                                        key: slugify(label),
                                    }));
                                }}
                            />

                            {/* TYPE */}
                            <TextField
                                size="small"
                                label="Type"
                                select
                                fullWidth
                                margin="dense"
                                value={editField.type}
                                onChange={(e) =>
                                    setEditField((prev) => ({
                                        ...prev!,
                                        type: e.target.value,
                                    }))
                                }
                            >
                                {fieldTypes.map((t) => (
                                    <MenuItem key={t} value={t}>
                                        {t}
                                    </MenuItem>
                                ))}
                            </TextField>

                            {/* OPTIONS (for select) */}
                            {editField.type === "select" && (
                                <TextField
                                    size="small"
                                    label="Options (comma separated)"
                                    fullWidth
                                    margin="dense"
                                    value={editField.options.join(",")}
                                    onChange={(e) =>
                                        setEditField((prev) => ({
                                            ...prev!,
                                            options: e.target.value.split(","),
                                        }))
                                    }
                                />
                            )}

                            <Button
                                sx={{ mt: 1 }}
                                variant="contained"
                                fullWidth
                                onClick={updateFieldHandler}
                            >
                                Update Field
                            </Button>
                        </Box>
                    </>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
