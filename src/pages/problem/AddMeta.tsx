import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  IconButton,
  Stack,
  Switch,
} from "@mui/material";
import { AddCircleOutline, DeleteOutline } from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from "../../config/config";
import { useProblemDetails } from "./hooks/useGetProblem";
import { useSnackbar } from "notistack"; // ✅ for toast notifications

const LANG_OPTIONS = ["python", "cpp", "java", "c"];

interface AddMetaProps {
  problemId: string;
  setActiveStep?: React.Dispatch<React.SetStateAction<number>>;
}

export default function AddMeta({ problemId }: AddMetaProps) {
  const [loading, setLoading] = useState(false);
  const { problem, loading: isLoading, error } = useProblemDetails();
  const { enqueueSnackbar } = useSnackbar(); // ✅ Initialize notistack

  const [meta, setMeta] = useState({
    constraints: [""],
    timeLimit: 1000,
    memoryLimit: 256000,
    hints: "",
    isPublic: false,
    languagesSupported: ["python", "cpp", "java", "c"],
  });

  const [errors, setErrors] = useState<any>({});

  // ✅ Prefill meta when problem loads
  useEffect(() => {
    if (!problem) return;
    setMeta({
      constraints: problem.constraints?.length ? problem.constraints : [""],
      timeLimit: problem.timeLimit || 1000,
      memoryLimit: problem.memoryLimit || 256000,
      hints: Array.isArray(problem.hints) ? problem.hints.join(", ") : "",
      isPublic: problem.isPublic ?? false,
      languagesSupported:
        problem.languagesSupported?.length > 0
          ? problem.languagesSupported
          : ["python", "cpp", "java", "c"],
    });
  }, [problem]);

  // 🔹 Handlers
  const handleConstraintChange = (index: number, value: string) => {
    const updated = [...meta.constraints];
    updated[index] = value;
    setMeta((prev) => ({ ...prev, constraints: updated }));
  };

  const addConstraint = () =>
    setMeta((prev) => ({ ...prev, constraints: [...prev.constraints, ""] }));

  const removeConstraint = (index: number) =>
    setMeta((prev) => ({
      ...prev,
      constraints: prev.constraints.filter((_, i) => i !== index),
    }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMeta((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitch = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setMeta((prev) => ({ ...prev, [name]: e.target.checked }));
  };

  const handleLanguagesChange = (e: any) => {
    const value = e.target.value;
    setMeta((prev) => ({
      ...prev,
      languagesSupported: typeof value === "string" ? value.split(",") : value,
    }));
  };

  // 🔹 Validate before submit
  const validateForm = () => {
    let temp: any = {};
    if (!meta.constraints.some((c) => c.trim() !== "")) temp.constraints = "At least one constraint is required.";
    if (!meta.timeLimit || meta.timeLimit <= 0) temp.timeLimit = "Time limit is required.";
    if (!meta.memoryLimit || meta.memoryLimit <= 0) temp.memoryLimit = "Memory limit is required.";
    if (!meta.languagesSupported.length) temp.languagesSupported = "Select at least one language.";
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // 🔹 Submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      enqueueSnackbar("Please fill all required fields before saving.", {
        variant: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        problemId,
        ...meta,
        hints: meta.hints
          .split(",")
          .map((h) => h.trim())
          .filter((h) => h),
      };

      const { data } = await axios.post(`${BASE_URL}/api/campus/problem/add/meta`, payload);

      enqueueSnackbar("Metadata saved successfully!", { variant: "success" });
      console.log("✅ Saved metadata:", data);
    } catch (err: any) {
      console.error("❌ Error saving metadata:", err);
      enqueueSnackbar(err.response?.data?.message || "Failed to save metadata", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🧱 UI
  return (
    <Box sx={{ borderRadius: 3, opacity: loading || isLoading ? 0.6 : 1 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Problem Metadata
      </Typography>

      {isLoading ? (
        <Typography>Loading metadata...</Typography>
      ) : error ? (
        <Typography color="error">Failed to load problem data</Typography>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 2,
            }}
          >
            {/* 🔹 Constraints */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Constraints
              </Typography>
              {meta.constraints.map((constraint, index) => (
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  key={index}
                  sx={{ mb: 1 }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    value={constraint}
                    onChange={(e) => handleConstraintChange(index, e.target.value)}
                    placeholder="e.g. 1 ≤ N ≤ 10⁵"
                    error={!!errors.constraints && index === 0 && !constraint.trim()}
                    helperText={index === 0 && errors.constraints}
                  />
                  <IconButton
                    color="error"
                    onClick={() => removeConstraint(index)}
                    disabled={meta.constraints.length === 1}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
              <Button startIcon={<AddCircleOutline />} size="small" onClick={addConstraint} sx={{ mt: 1 }}>
                Add Constraint
              </Button>
            </Box>

            <TextField
              label="Time Limit (ms)"
              name="timeLimit"
              value={meta.timeLimit}
              onChange={handleChange}
              fullWidth
              size="small"
              type="number"
              error={!!errors.timeLimit}
              helperText={errors.timeLimit}
            />

            <TextField
              label="Memory Limit (KB)"
              name="memoryLimit"
              value={meta.memoryLimit}
              onChange={handleChange}
              fullWidth
              size="small"
              type="number"
              error={!!errors.memoryLimit}
              helperText={errors.memoryLimit}
            />

            <TextField
              label="Hints (comma separated)"
              name="hints"
              value={meta.hints}
              onChange={handleChange}
              fullWidth
              size="small"
              multiline
              rows={2}
              placeholder="e.g. Try binary search, Optimize loops"
            />

            <FormControl fullWidth size="small" error={!!errors.languagesSupported}>
              <InputLabel>Languages Supported</InputLabel>
              <Select
                multiple
                name="languagesSupported"
                value={meta.languagesSupported}
                onChange={handleLanguagesChange}
                input={<OutlinedInput label="Languages Supported" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value: string) => (
                      <Chip key={value} label={value.toUpperCase()} />
                    ))}
                  </Box>
                )}
              >
                {LANG_OPTIONS.map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
              {errors.languagesSupported && (
                <Typography color="error" variant="caption">
                  {errors.languagesSupported}
                </Typography>
              )}
            </FormControl>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography>Public</Typography>
              <Switch checked={meta.isPublic} onChange={handleSwitch("isPublic")} />
            </Box>
          </Box>

          {/* 🔹 Save Button */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              sx={{
                textTransform: "none",
                px: 4,
                borderRadius: 2,
              }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Metadata"}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
