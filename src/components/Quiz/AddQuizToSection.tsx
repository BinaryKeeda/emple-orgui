// AddQuizToSection.tsx
import React, { useState } from "react";
import { Modal, Box, Typography, TextField, Button, MenuItem } from "@mui/material";
import axios from "axios";
import { BASE_URL } from "../../config/config";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";

interface AddQuizToSectionProps {
  open: boolean;
  onClose: () => void;
  sectionId: string;
}

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 450,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const AddQuizToSection: React.FC<AddQuizToSectionProps> = ({ open, onClose, sectionId }) => {
  const [title, setTitle] = useState("");
  const [marks, setMarks] = useState(0);
  const [duration, setDuration] = useState(30);
  const [category, setCategory] = useState("Core");
  const [difficulty, setDifficulty] = useState("Medium");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const handleCreateQuiz = async () => {
    if (!title.trim()) {
      setMessage("Quiz title is required");
      setIsError(true);
      return;
    }
    if (marks <= 0) {
      setMessage("Marks must be greater than 0");
      setIsError(true);
      return;
    }
    if (duration <= 0) {
      setMessage("Duration must be greater than 0");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/campus/create/quiz/${sectionId}`,
        { title, marks, duration, category, difficulty, sectionId },
        { withCredentials: true }
      );

      if (res.data.success) {
        // setMessage("Quiz created successfully!");
        queryClient.invalidateQueries({ queryKey: ["quizzes", sectionId] });
        enqueueSnackbar("Quiz created successfully!", { variant: "success" });
        setIsError(false);
        // Reset form
        onClose()
        setTitle("");
        setMarks(0);
        setDuration(30);
        setCategory("Core");
        setDifficulty("Medium");
      } else {
        setMessage(res.data.message || "Failed to create quiz");
        setIsError(true);
      }
    } catch (err: any) {
      console.error(err);
      setMessage(err?.response?.data?.message || "Internal Server Error");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>

        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Quiz Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />

          <Box display="flex" gap={2}>
            <TextField
              label="Marks"
              type="number"
              value={marks}
              onChange={(e) => setMarks(Number(e.target.value))}
              fullWidth
            />
            <TextField
              label="Duration (minutes)"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              fullWidth
            />
          </Box>

          <Box display="flex" gap={2}>
            <TextField
              select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              fullWidth
            >
              <MenuItem value="Core">Core</MenuItem>
              <MenuItem value="Aptitude">Aptitude</MenuItem>
              <MenuItem value="Miscellaneous">Misc</MenuItem>
            </TextField>

            <TextField
              select
              label="Difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              fullWidth
            >
              <MenuItem value="Easy">Easy</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Hard">Hard</MenuItem>
            </TextField>
          </Box>

          <Button
            sx={{
              backgroundColor: '#FF5C01', // Deep Orange
              color: '#ffffff',
            }}
            variant="contained"
            color="primary"
            onClick={handleCreateQuiz}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Quiz"}
          </Button>

          {message && (
            <Typography
              textAlign="center"
              color={isError ? "error" : "success.main"}
            >
              {message}
            </Typography>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default AddQuizToSection;
