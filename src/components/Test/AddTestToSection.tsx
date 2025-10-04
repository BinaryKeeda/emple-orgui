// AddTestModal.tsx
import React, { useState } from "react";
import { Modal, Box, Typography, TextField, Button, MenuItem, CircularProgress } from "@mui/material";
import axios from "axios";
import { BASE_URL } from "../../config/config";

interface AddTestModalProps {
  open: boolean;
  onClose: () => void;
  sectionId:string
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
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === "duration" ? Number(value) : value,
    }));
  };

  const handleCreateTest = async () => {
    if (!form.name.trim()) {
      setMessage("Test name is required");
      setIsError(true);
      return;
    }
    if (form.duration <= 0) {
      setMessage("Duration must be greater than 0");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/campus/create/test/${sectionId}`,
        form ,
        { withCredentials: true }
      );

      if (res.data?.data) {
        setMessage("Test created successfully!");
        setIsError(false);
        // onTestCreated?.(res.data.data);
        setForm(defaultForm); // reset form
      } else {
        setMessage(res.data?.error || "Failed to create test");
        setIsError(true);
      }
    } catch (err: any) {
      console.error(err);
      setMessage(err?.response?.data?.error || "Internal Server Error");
      setIsError(true);
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
          {/* <TextField
            select
            label="Visibility"
            name="visibility"
            value={form.visibility}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="private">Private</MenuItem>
            <MenuItem value="public">Public</MenuItem>
          </TextField> */}
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
              backgroundColor: '#FF5C01', // Deep Orange
            color: '#ffffff',
            }}
          >
            {loading ? <CircularProgress size={20} /> : "Create Test"}
          </Button>

          {message && (
            <Typography textAlign="center" color={isError ? "error" : "success.main"}>
              {message}
            </Typography>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default AddTestModal;
