import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import MDEditor from "@uiw/react-md-editor";
import axios from "axios";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import type { Problem } from "./hooks/useGetProblem";
import { BASE_URL } from "../../config/config";

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
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

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
      const res = await axios.post(`${BASE_URL}/api/campus/problem/add/basicinfo`, payload , {withCredentials:true});
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problemDetails", problemId] });
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
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 3,
        }}
      >
        <TextField
          size="small"
          label="Problem Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Problem Description (Markdown Supported)
        </Typography>
        <MDEditor
          value={description}
          onChange={(val) => setDescription(val || "")}
          height={300}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          padding: "30px 0",
          gap: 2,
          justifyContent: "end",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => updateProblem.mutate()}
          disabled={updateProblem.isPending}
        >
          {updateProblem.isPending ? "Saving..." : "Save"}
        </Button>

        <Button
          onClick={() => setActiveStep((prev) => prev + 1)}
          variant="contained"
          color="secondary"
        >
          Next
        </Button>
      </Box>
    </>
  );
};

export default AddBasicDetails;
