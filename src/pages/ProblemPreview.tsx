import { useState } from "react";
import Editor from "@monaco-editor/react";
import { useProblemDetails } from "./problem/hooks/useGetProblem";
import {
  Box,
  Button,
  Typography,
  MenuItem,
  Select,
  Paper,
  CircularProgress,
  Divider,
} from "@mui/material";
import axios from "axios";
import { JUDGE0_BASE } from "./problem/helper";

const JUDGE0_API = `${JUDGE0_BASE}/batch`;

// ---------- Types ----------
interface TestCase {
  input: string;
  output: string;
}

interface OutputResult {
  input?: string;
  expected?: string;
  output: string;
}

interface Judge0Response {
  stdout?: string | null;
  stderr?: string | null;
}

// ---------- Component ----------
export default function ProblemPreview() {
  const { problem } = useProblemDetails();

  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState<string>(
    problem?.functionSignature?.[0]?.signature || ""
  );
  const [outputs, setOutputs] = useState<OutputResult[]>([]);
  const [loading, setLoading] = useState(false);

  const languageMap: Record<string, number> = {
    cpp: 54, // C++ (GCC 9.2.0)
    java: 62, // Java (OpenJDK 15)
    c: 50, // C (GCC 9.2.0)
  };

  // ---------- Run Code ----------
  const handleRun = async () => {
    if (!code || !problem?.testCases) return;

    setLoading(true);
    setOutputs([]);

    try {
      // Create batch submission for each test case
      const submissions = problem.testCases.map((tc: TestCase) => ({
        language_id: languageMap?.[language],
        source_code: code,
        stdin: tc.input,
      }));

      // Call Judge0 batch API
      const { data } = await axios.post<Judge0Response[]>(JUDGE0_API, {
        submissions,
      });

      // Map results
      const results: OutputResult[] = data.map(
        (res: Judge0Response, idx: number) => ({
          input: problem.testCases[idx].input,
          expected: problem.testCases[idx].output,
          output: res.stdout || res.stderr || "No output",
        })
      );

      setOutputs(results);
    } catch (err) {
      console.error(err);
      setOutputs([{ output: "Error running code" }]);
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {problem?.title}
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="body1" gutterBottom>
          {problem?.description}
        </Typography>
      </Paper>

      {/* Language + Run Button */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Typography>Language:</Typography>

        <Select
          value={language}
          onChange={(e) => {
            const selected = e.target.value;
            setLanguage(selected);

            const sig = problem?.functionSignature?.find(
              (f: any) => f.language === selected
            );

            setCode(sig?.signature || "");
          }}
        >
          {problem?.languagesSupported?.map((lang: string) => (
            <MenuItem key={lang} value={lang}>
              {lang.toUpperCase()}
            </MenuItem>
          ))}
        </Select>

        <Button variant="contained" onClick={handleRun} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Run"}
        </Button>
      </Box>

      {/* Monaco Editor */}
      <Editor
        height="400px"
        language={language}
        value={code}
        onChange={(value) => setCode(value || "")}
        theme="vs-dark"
      />

      {/* Output Section */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6">Outputs:</Typography>

        {outputs.length === 0 && <Typography>No output yet</Typography>}

        {outputs.map((res, idx) => (
          <Box key={idx} sx={{ mb: 1 }}>
            <Typography>
              <strong>Test Case {idx + 1}:</strong>
            </Typography>
            <Typography>Input: {res.input}</Typography>
            <Typography>Expected: {res.expected}</Typography>
            <Typography>Output: {res.output}</Typography>
            <Divider sx={{ my: 1 }} />
          </Box>
        ))}
      </Paper>
    </Box>
  );
}
