import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Select,
  IconButton,
} from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import CloseIcon from "@mui/icons-material/Close";
import AceEditor from "react-ace";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../../config/config";
import { useProblemDetails } from "./hooks/useGetProblem";

// Ace setup
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-searchbox";
import { useSnackbar } from "notistack";

interface AddLanguagesProps {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  problemId?: string;
}

const AddLanguages: React.FC<AddLanguagesProps> = ({ problemId }) => {
  const [selectedLang, setSelectedLang] = useState<string>("c");
  const [code, setCode] = useState<string>("");
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const { problem, loading: problemLoading } = useProblemDetails();
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    if (!problem) return;

    const existingLang = problem?.functionSignature?.find(
      (l: any) => l.language === selectedLang
    );

    if (existingLang?.signature) {
      setCode(existingLang.signature);
    } else {
      setCode(`// Starter code for ${selectedLang.toUpperCase()}`);
    }
  }, [selectedLang, problem]);

  const { mutateAsync: saveLanguage, isPending } = useMutation({
    mutationFn: async () => {
      if (!problemId) return;
      const payload = { language: selectedLang, code, problemId };

      await axios.post(
        `${BASE_URL}/api/campus/problem/add/languages`,
        payload
      );

    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problem", problemId] });
      enqueueSnackbar({ message: `${selectedLang.toUpperCase()} code saved successfully!`, variant: 'success' });
    },
  });

  const handleSave = async () => {
    try {
      await saveLanguage();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save code");
    }
  };

  const getAceMode = (lang: string) => {
    switch (lang) {
      case "c":
      case "cpp":
        return "c_cpp";
      case "java":
        return "java";
      case "python":
        return "python";
      default:
        return "text";
    }
  };

  if (problemLoading) {
    return <Typography>Loading problem details...</Typography>;
  }

  return (
    <Box>
      {/* Top Controls */}
      <Box
        sx={{
          gap: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <FormControl>
          <InputLabel>Language</InputLabel>
          <Select
            sx={{ width: "300px" }}
            size="small"
            value={selectedLang}
            label="Language"
            onChange={(e) => setSelectedLang(e.target.value)}
          >
            <MenuItem value="c">C</MenuItem>
            <MenuItem value="cpp">C++</MenuItem>
            <MenuItem value="java">Java</MenuItem>
            <MenuItem value="python">Python</MenuItem>
          </Select>
        </FormControl>

        <IconButton color="primary" onClick={() => setIsFullScreen(true)}>
          <FullscreenIcon />
        </IconButton>
      </Box>

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Edit Code ({selectedLang.toUpperCase()})
      </Typography>

      <Box
        sx={{
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <AceEditor
          mode={getAceMode(selectedLang)}
          theme="github"
          name="code-editor"
          fontSize={14}
          width="100%"
          height="300px"
          value={code}
          onChange={(val) => setCode(val)}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            showLineNumbers: true,
            tabSize: 2,
          }}
        />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button variant="contained" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save Code"}
        </Button>
      </Box>

      {/* Fullscreen Mode */}
      {isFullScreen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 1500,
            backgroundColor: "white",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              borderBottom: "1px solid #ddd",
              backgroundColor: "#f9f9f9",
            }}
          >
            <Typography variant="h6">
              {selectedLang.toUpperCase()} Editor
            </Typography>
            <IconButton color="error" onClick={() => setIsFullScreen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <AceEditor
              mode={getAceMode(selectedLang)}
              theme="github"
              name="fullscreen-editor"
              fontSize={16}
              width="100%"
              height="100%"
              value={code}
              onChange={(val) => setCode(val)}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                showLineNumbers: true,
                tabSize: 2,
              }}
            />
          </Box>

          <Box
            sx={{
              p: 2,
              borderTop: "1px solid #ddd",
              backgroundColor: "#f9f9f9",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="contained"
              onClick={() => {
                handleSave();
                setIsFullScreen(false);
              }}
            >
              Save & Exit
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AddLanguages;
