import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import {
  AddCircleOutline,
  DeleteOutline,
  PlayArrow,
  ArrowBackIosNew,
  ArrowForwardIos,
} from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from "../../config/config";
import { useProblemDetails } from "./hooks/useGetProblem";
import { runSingleTest } from "./helper";

interface TestCase {
  input: string;
  output: string;
  hidden: boolean;
}

export default function AddTestCases({
  problemId,
}: {
  problemId?: string;
  setActiveStep?: (step: number) => void;
}) {
  // console.log(setActiveIndex);
  const { problem } = useProblemDetails();
  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: "", output: "", hidden: true },
  ]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);
  const [language, setLanguage] = useState("cpp");

  // 🧠 Load test cases from API
  useEffect(() => {
    if (problem?.testCases?.length) {
      setTestCases(
        problem.testCases.map((t: any) => ({
          input: t.input,
          output: t.output,
          hidden: t.hidden ?? true,
        }))
      );
    }
  }, [problem]);

  const handleChange = <K extends keyof TestCase>(
    field: K,
    value: TestCase[K]
  ) => {
    setTestCases((prev) => {
      const updated = [...prev];
      const current = updated[activeIndex];
      if (!current) return prev;
      updated[activeIndex] = { ...current, [field]: value };
      return updated;
    });
  };

  const handleAddTestCase = () => {
    if (testCases.length >= 15) return;
    setTestCases([...testCases, { input: "", output: "", hidden: true }]);
    setActiveIndex(testCases.length);
  };

  const handleDeleteTestCase = (index: number) => {
    const updated = testCases.filter((_, i) => i !== index);
    setTestCases(updated);
    if (activeIndex >= updated.length) setActiveIndex(updated.length - 1);
  };

  const handleSaveAll = async () => {
    try {
      await axios.post(`${BASE_URL}/api/campus/problem/add/testcases`, {
        problemId,
        testCases,
      });
      alert("Test cases saved successfully!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save test cases");
    }
  };

  const handleRunTest = async () => {
    const tc = testCases[activeIndex];

    // 🔥 Dynamically choose the code for selected language
    const code =
      problem?.functionSignature?.find((f: any) => f.language === language)
        ?.signature ||
      "";

    if (!code.trim()) return alert("No code found for this language");

    try {
      setIsRunning(true);
      setRunResult(null);

      const result = await runSingleTest({
        language,
        source_code: code,
        input: tc.input,
        expectedOutput: tc.output,
      });

      setRunResult(result);
    } catch (err: any) {
      setRunResult({
        stderr: err.message,
        status: "Error",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const MAX_TEST_CASES = 15;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        mx: "auto",
        px: 3,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        backgroundColor: "#fff",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Add Test Cases
        </Typography>
        <Button
          variant="contained"
          sx={{ textTransform: "none", px: 3 }}
          onClick={handleSaveAll}
        >
          Save All
        </Button>
      </Box>

      {problem?.languagesSupported && problem?.languagesSupported?.length > 0 && (
        <FormControl fullWidth size="small" sx={{ maxWidth: 300 }}>
          <InputLabel>Language</InputLabel>
          <Select
            label="Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {problem.languagesSupported.map((lang: string) => (
              <MenuItem key={lang} value={lang}>
                {lang.toUpperCase()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          mt: 1,
        }}
      >
        <IconButton
          disabled={activeIndex === 0}
          onClick={() => setActiveIndex((prev) => Math.max(prev - 1, 0))}
          size="small"
        >
          <ArrowBackIosNew fontSize="small" />
        </IconButton>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            overflowX: "auto",
            py: 1,
            px: 1,
          }}
        >
          {testCases.map((_, i) => (
            <Tooltip key={i} title={`Test Case #${i + 1}`}>
              <Box
                onClick={() => setActiveIndex(i)}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: i === activeIndex ? "#1976d2" : "#e0e0e0",
                  color: i === activeIndex ? "#fff" : "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "0.3s",
                  "&:hover": {
                    backgroundColor:
                      i === activeIndex ? "#1565c0" : "#d5d5d5",
                  },
                }}
              >
                {i + 1}
              </Box>
            </Tooltip>
          ))}

          <Tooltip
            title={
              testCases.length >= MAX_TEST_CASES
                ? "Maximum 15 test cases allowed"
                : "Add New Test Case"
            }
          >
            <span>
              <IconButton
                color="primary"
                size="small"
                onClick={handleAddTestCase}
                disabled={testCases.length >= MAX_TEST_CASES}
              >
                <AddCircleOutline />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        <IconButton
          disabled={activeIndex === testCases.length - 1}
          onClick={() =>
            setActiveIndex((prev) => Math.min(prev + 1, testCases.length - 1))
          }
          size="small"
        >
          <ArrowForwardIos fontSize="small" />
        </IconButton>
      </Box>

      <Divider />

      {/* ACTIVE TEST CASE EDITOR */}
      {testCases[activeIndex] && (
        <Paper
          elevation={1}
          sx={{
            p: 3,
            borderRadius: 2,
            backgroundColor: "#fafafa",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Test Case #{activeIndex + 1}
            </Typography>
            <IconButton
              color="error"
              onClick={() => handleDeleteTestCase(activeIndex)}
            >
              <DeleteOutline />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              label="Input"
              multiline
              minRows={4}
              value={testCases[activeIndex].input}
              onChange={(e) => handleChange("input", e.target.value)}
              fullWidth
              size="small"
              placeholder="Enter input..."
              sx={{
                "& .MuiInputBase-root": { fontFamily: "monospace" },
              }}
            />
            <TextField
              label="Expected Output"
              multiline
              minRows={4}
              value={testCases[activeIndex].output}
              onChange={(e) => handleChange("output", e.target.value)}
              fullWidth
              size="small"
              placeholder="Enter expected output..."
              sx={{
                "& .MuiInputBase-root": { fontFamily: "monospace" },
              }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={testCases[activeIndex].hidden}
                  onChange={(e) =>
                    handleChange("hidden", e.target.checked)
                  }
                />
              }
              label="Hidden"
            />

            <Button
              size="small"
              variant="outlined"
              startIcon={
                isRunning ? <CircularProgress size={18} /> : <PlayArrow />
              }
              onClick={handleRunTest}
              disabled={isRunning}
            >
              Run Test
            </Button>
          </Box>

          {/* Run Result Display */}
          {runResult && (
            <Paper
              variant="outlined"
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: runResult.passed ? "#e8f5e9" : "#ffebee",
              }}
            >
              <Typography fontWeight={600}>
                Status: {runResult.status || "Unknown"}
              </Typography>
              {runResult.stdout && (
                <Typography fontFamily="monospace" sx={{ mt: 1 }}>
                  Output: {runResult.stdout}
                </Typography>
              )}
              {runResult.stderr && (
                <Typography
                  color="error"
                  fontFamily="monospace"
                  sx={{ mt: 1 }}
                >
                  Error: {runResult.stderr}
                </Typography>
              )}
              {runResult.passed !== undefined && (
                <Typography
                  sx={{
                    mt: 1,
                    color: runResult.passed ? "green" : "red",
                    fontWeight: 600,
                  }}
                >
                  {runResult.passed ? "✅ Passed" : "❌ Failed"}
                </Typography>
              )}
            </Paper>
          )}
        </Paper>
      )}
    </Paper>
  );
}
