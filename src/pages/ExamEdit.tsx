/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
  Delete,
  InfoOutlined,
  Refresh,
} from "@mui/icons-material";
import { BASE_URL } from "../config/config";

// ------------------------------------------------
// MAIN EXAM EDIT PAGE
// ------------------------------------------------
export default function ExamEdit() {
  const { slug: examId } = useParams();
  const queryClient = useQueryClient();

  const fetchExam = async () => {
    const res = await axios.get(`${BASE_URL}/api/exam/particular/${examId}`);
    return res.data.data;
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["exam", examId],
    queryFn: fetchExam,
    enabled: !!examId,
  });

  if (isLoading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );

  if (isError)
    return (
      <Typography color="error" textAlign="center">
        Error: {(error as Error).message}
      </Typography>
    );

  return (
    <ContainerBox>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5" fontWeight={600}>
          Edit Exam
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </Stack>

      {data && (
        <>
          <ExamMeta data={data} />
          <ExamData examId={data._id} onSuccess={() => queryClient.invalidateQueries({ queryKey: ["exam", examId] })} />
          <SectionList examId={data._id} sections={data.sections} />
        </>
      )}
    </ContainerBox>
  );
}

const ContainerBox = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ mx: "auto", p: 2 }}>{children}</Box>
);

// ------------------------------------------------
// EXAM META INFO
// ------------------------------------------------
const ExamMeta = ({ data }: any) => {
  const [formData, setData] = useState({ name: data.name, isAvailable: data.isAvailable });
  const [isSaving, setSaving] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (field: string, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await axios.put(`${BASE_URL}/api/exam/update/${data._id}`, formData);
      enqueueSnackbar("✅ Exam updated successfully", { variant: "success" });
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || "Update failed", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ mt: 3, borderRadius: 3 }}>
      <CardHeader title="Exam Settings" />
      <Divider />
      <CardContent>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            label="Exam Name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.isAvailable}
                onChange={(e) => handleChange("isAvailable", e.target.checked)}
              />
            }
            label="Available"
          />
        </Stack>
        <Button
          variant="contained"
          sx={{ mt: 3 }}
          onClick={handleUpdate}
          disabled={isSaving}
          startIcon={isSaving && <CircularProgress size={18} color="inherit" />}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
};

// ------------------------------------------------
// ADD SECTION
// ------------------------------------------------
const sectionTypes = [
  { value: "quiz", label: "Quiz" },
  { value: "coding", label: "Coding" },
];

const ExamData = ({ examId, onSuccess }: any) => {
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState({
    title: "",
    description: "",
    maxQuestion: "",
    maxTime: "",
    maxScore: "",
    type: "quiz",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(`${BASE_URL}/api/exam/add/section/${examId}`, form);
      return res.data;
    },
    onSuccess: () => {
      enqueueSnackbar("✅ Section added successfully", { variant: "success" });
      setForm({ title: "", description: "", maxQuestion: "", maxTime: "", maxScore: "", type: "quiz" });
      onSuccess();
    },
    onError: (err: any) => {
      enqueueSnackbar(err.response?.data?.message || "Error adding section", { variant: "error" });
    },
  });

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        ➕ Add New Section
      </Typography>

      <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }} gap={2}>
        <TextField
          label="Title"
          name="title"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          required
        />
        <TextField
          label="Max Questions"
          name="maxQuestion"
          type="number"
          value={form.maxQuestion}
          onChange={(e) => setForm((p) => ({ ...p, maxQuestion: e.target.value }))}
        />
        <TextField
          label="Max Time (minutes)"
          name="maxTime"
          type="number"
          value={form.maxTime}
          onChange={(e) => setForm((p) => ({ ...p, maxTime: e.target.value }))}
        />
        <TextField
          label="Max Score"
          name="maxScore"
          type="number"
          value={form.maxScore}
          onChange={(e) => setForm((p) => ({ ...p, maxScore: e.target.value }))}
        />
        <TextField select label="Section Type" name="type" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
          {sectionTypes.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 3 }}
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !form.title.trim()}
        startIcon={mutation.isPending && <CircularProgress size={18} color="inherit" />}
      >
        {mutation.isPending ? "Adding..." : "Add Section"}
      </Button>
    </Paper>
  );
};

// ------------------------------------------------
// SECTION LIST
// ------------------------------------------------

const SectionList = ({ sections, examId }: any) => {
  const [open, setOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [poolType, setPoolType] = useState<"question" | "problem" | null>(null);

  const handleOpen = (section: any) => {
    setSelectedSection(section);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedSection(null);
  };

  const handleAddPool = (section: any) => {
    setSelectedSection(section);
    if (section.type === "quiz") setPoolType("question");
    else setPoolType("problem");
  };

  const handlePoolClose = () => {
    setPoolType(null);
    setSelectedSection(null);
  };

  if (!sections?.length)
    return (
      <Typography variant="body1" textAlign="center" sx={{ mt: 5, opacity: 0.6 }}>
        No sections added yet
      </Typography>
    );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", border: "1px solid #e1e1e1", mt: 5, p: 2 }}>
      <Typography variant="h6" fontWeight={600} mb={2}>
        Sections
      </Typography>

      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }}
        gap={3}
      >
        {sections.map((section: any) => {
          const hasPool =
            section.type === "quiz"
              ? section.questionPool
              : section.problemPool?.length > 0;

          return (
            <Paper
              key={section._id}
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                transition: "0.3s",
                "&:hover": { boxShadow: 6 },
              }}
            >
              <IconButton
                sx={{ position: "absolute", top: 4, right: 36 }}
              >
                <Delete />
              </IconButton>
              <IconButton
                size="small"
                sx={{ position: "absolute", top: 8, right: 8 }}
                onClick={() => handleOpen(section)}
              >
                <InfoOutlined />
              </IconButton>

              <Typography variant="h6" fontWeight={600}>
                {section.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Type: {section.type}
              </Typography>

              <Box mt="auto">
                <Button
                  fullWidth
                  variant="contained"
                  color={section.type === "quiz" ? "primary" : "secondary"}
                  onClick={() => handleAddPool(section)}
                >
                  {hasPool
                    ? section.type === "quiz"
                      ? "Update Question Pool"
                      : "Update Problem Pool"
                    : section.type === "quiz"
                      ? "Add Question Pool"
                      : "Add Problem Pool"}
                </Button>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* Section info dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedSection?.title}</DialogTitle>
        <Divider />
        <DialogContent dividers>
          {selectedSection ? (
            <Stack spacing={1}>
              <Typography>
                <strong>Type:</strong> {selectedSection.type}
              </Typography>
              <Typography>
                <strong>Max Questions:</strong> {selectedSection.maxQuestion}
              </Typography>
              <Typography>
                <strong>Max Time:</strong> {selectedSection.maxTime}
              </Typography>
              <Typography>
                <strong>Max Score:</strong> {selectedSection.maxScore}
              </Typography>
              <Typography>
                <strong>Description:</strong>{" "}
                {selectedSection.description || "No description"}
              </Typography>
              {selectedSection.type === "quiz" && selectedSection.questionPool && (
                <Typography>
                  <strong>Linked Pool:</strong> {selectedSection.questionPool.name}
                </Typography>
              )}
              {selectedSection.type === "coding" &&
                selectedSection.problemPool?.length > 0 && (
                  <Typography>
                    <strong>Problems:</strong>{" "}
                    {selectedSection.problemPool.length} added
                  </Typography>
                )}
            </Stack>
          ) : (
            <Typography>Loading...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Pool dialogs */}
      {poolType === "question" && selectedSection && (
        <AddQuestionPool
          open
          examId={examId}
          onClose={handlePoolClose}
          data={selectedSection}
        />
      )}
      {poolType === "problem" && selectedSection && (
        <AddProblemPool
          examId={examId}
          open
          onClose={handlePoolClose}
          data={selectedSection}
        />
      )}
    </Box>
  );
};

// ✅ Updated AddQuestionPool
export const AddQuestionPool = ({
  open,
  onClose,
  data,
  examId,
}: {
  open: boolean;
  onClose: () => void;
  data: any;
  examId: string;
}) => {
  const [selectedPool, setSelectedPool] = useState<any>(data.questionPool || null);
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams()

  const { data: poolData, isLoading } = useQuery({
    queryKey: ["questionPools", examId],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/api/exam/questionbank/${id}`);
      return res.data;
    },
  });

  const { mutate: updatePool, isPending } = useMutation({
    mutationFn: async () =>
      axios.post(
        `${BASE_URL}/api/exam/add/questionPool/${examId}/${data._id}`,
        { questionPoolId: selectedPool._id }
      ),
    onSuccess: () => {
      enqueueSnackbar("Pool updated successfully", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
      onClose();
    },
    onError: () => {
      enqueueSnackbar("Failed to update pool", { variant: "error" });
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {data.questionPool ? "Update Question Pool" : "Add Question Pool"} for "{data.title}"
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <List>
            {poolData?.questions?.length ? (
              poolData.questions.map((pool: any) => (
                <ListItemButton
                  key={pool._id}
                  selected={selectedPool?._id === pool._id}
                  onClick={() => setSelectedPool(pool)}
                >
                  <ListItemText
                    primary={pool.name}
                    secondary={`${pool.questions?.length || 0} questions`}
                  />
                </ListItemButton>
              ))
            ) : (
              <Typography color="text.secondary">No pools found</Typography>
            )}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disabled={!selectedPool || isPending}
          onClick={() => updatePool()}
          variant="contained"
        >
          {isPending
            ? "Saving..."
            : data.questionPool
              ? "Update Pool"
              : "Add Pool"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ✅ Updated AddProblemPool
export const AddProblemPool = ({
  open,
  onClose,
  data,
  examId,
}: {
  open: boolean;
  onClose: () => void;
  data: any;
  examId: string;
}) => {
  const [selectedProblems, setSelectedProblems] = useState<string[]>(
    data.problemPool?.map((p: any) => p._id) || []
  );
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { data: problemData, isLoading } = useQuery({
    queryKey: ["problems"],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/api/exam/problems?limit=20`);
      return res.data;
    },
  });

  const toggleSelect = (id: string) => {
    setSelectedProblems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const { mutate: updateProblems, isPending } = useMutation({
    mutationFn: async () =>
      axios.post(
        `${BASE_URL}/api/exam/add/problemPool/${examId}/${data._id}`,
        { problemIds: selectedProblems }
      ),
    onSuccess: () => {
      enqueueSnackbar("Problem pool updated", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
      onClose();
    },
    onError: () => {
      enqueueSnackbar("Failed to update problems", { variant: "error" });
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {data.problemPool?.length
          ? `Update Problems for "${data.title}"`
          : `Add Problems to "${data.title}"`}
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <List>
            {problemData?.data?.length ? (
              problemData.data.map((problem: any) => (
                <ListItemButton
                  key={problem._id}
                  selected={selectedProblems.includes(problem._id)}
                  onClick={() => toggleSelect(problem._id)}
                >
                  <ListItemText
                    primary={problem.title}
                    secondary={`Difficulty: ${problem.difficulty || "N/A"}`}
                  />
                </ListItemButton>
              ))
            ) : (
              <Typography color="text.secondary">No problems found</Typography>
            )}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disabled={!selectedProblems.length || isPending}
          onClick={() => updateProblems()}
          variant="contained"
        >
          {isPending
            ? "Saving..."
            : data.problemPool?.length
              ? "Update Problems"
              : "Add Problems"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
