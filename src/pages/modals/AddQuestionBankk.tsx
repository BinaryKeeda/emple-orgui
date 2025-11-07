import React, { useState } from "react";
import {
  Box,
  Modal,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { BASE_URL } from "../../config/config";
import { useParams } from "react-router-dom";

const categories = ["Core", "Aptitude", "Excel", "Miscellaneous"];

interface CreateBankModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateBankModal: React.FC<CreateBankModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const {id:sectionId} = useParams();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !category) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/api/exam/create/bank`, {
        name,
        category,
        sectionId
      });
   
      setName("");
      setCategory("");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to create bank");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          backgroundColor: "background.paper",
          borderRadius: 3,
          boxShadow: 5,
          p: 4,
          width: 400,
          mx: "auto",
          mt: "15vh",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6" fontWeight="600" textAlign="center">
          Create Question Bank
        </Typography>

        <TextField
          label="Bank Name"
          variant="outlined"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <TextField
          select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          fullWidth
        >
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>

        <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
          <Button onClick={onClose} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "Create"}
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default CreateBankModal;
