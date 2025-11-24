// AddTestModal.tsx
import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  CircularProgress
} from "@mui/material";
import axios from "axios";
import { useSnackbar } from "notistack";
import { BASE_URL } from "../../config/config";
import { useQueryClient } from "@tanstack/react-query";

interface AddTestModalProps {
  open: boolean;
  onClose: () => void;
  sectionId: string;
}

interface TestForm {
  name: string;
  description: string;
  duration: number;
  visibility: "private";
  category: "Placements" | "Gate";
}

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const defaultForm: TestForm = {
  name: "",
  description: "",
  duration: 30,
  visibility: "private",
  category: "Placements",
};

const AddTestModal: React.FC<AddTestModalProps> = ({ open, onClose, sectionId }) => {
  const [form, setForm] = useState<TestForm>(defaultForm);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "duration" ? Number(value) : value,
    }));
  };

  const handleCreateTest = async () => {
    if (!form.name.trim()) {
      enqueueSnackbar("Test name is required", { variant: "error" });
      return;
    }
    if (form.duration <= 0) {
      enqueueSnackbar("Duration must be greater than 0", { variant: "error" });
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${BASE_URL}/api/campus/create/test/${sectionId}`,
        form,
        { withCredentials: true }
      );

        enqueueSnackbar("Test created successfully!", { variant: "success" });
        await queryClient.invalidateQueries({ queryKey: ["exam"] });
        onClose()
    } catch (err: any) {
      console.error(err);
      enqueueSnackbar(err?.response?.data?.error || "Internal Server Error", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" fontWeight="bold" mb={3}>
          Create New Test
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Test Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
          />
          <TextField
            label="Duration (minutes)"
            name="duration"
            type="number"
            value={form.duration}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            select
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="Placements">Placements</MenuItem>
            <MenuItem value="Gate">Gate</MenuItem>
          </TextField>

          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateTest}
            disabled={loading}
            sx={{
              backgroundColor: "#FF5C01",
              color: "#ffffff",
              
            }}
          >
            {loading ? <CircularProgress size={20} /> : "Create Test"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddTestModal;
