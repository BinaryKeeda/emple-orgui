import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import MDEditor from "@uiw/react-md-editor";
import axios from "axios";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import type { Problem } from "./hooks/useGetProblem";
import { BASE_URL } from "../../config/config";
import { useSnackbar } from "notistack";

interface AddBasicDetailsProps {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  problemId?: string;
  problem: Problem | null;
}
const AddBasicDetails: React.FC<AddBasicDetailsProps> = ({
  problem,
  setActiveStep,
  problemId,
}) => {
  console.log(setActiveStep)
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (problem) {
      setTitle(problem.title || "");
      setDescription(problem.description || "");
    }
  }, [problem]);

  const updateProblem = useMutation({
    mutationFn: async () => {
      if (!problemId) return;
      const payload = {
        title,
        description,
        problemId
      };
      const res = await axios.post(`${BASE_URL}/api/campus/problem/add/basicinfo`, payload, { withCredentials: true });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problemDetails", problemId] });
      enqueueSnackbar({ message: "Problem details saved successfully!", variant: 'success' });
    },
  });

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {problemId ? "Edit Problem Details" : "Add Problem Details"}
      </Typography>

      <Box
        component="form"
        sx={{
          display: "flex",
          justifyContent:"space-between",
          gap: 3,
        }}
      >
        <TextField
          size="small"
          label="Problem Title"
          required
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Button
          variant="contained"
          color="primary"
          sx={{width:"max-content"}}
          onClick={() => updateProblem.mutate()}
          disabled={updateProblem.isPending}
        >
          {updateProblem.isPending ? "Saving..." : "Save"}
        </Button>


      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Problem Description (Markdown Supported)
        </Typography>
        <MDEditor
          value={description}
          onChange={(val) => setDescription(val || "")}
          height={550}
        />
      </Box>


    </>
  );
};

export default AddBasicDetails;
