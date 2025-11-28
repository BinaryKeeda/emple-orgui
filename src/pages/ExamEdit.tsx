/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
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
  Pagination,
  Checkbox,
  Radio,
  Select,
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
  Delete,
  Edit,
} from "@mui/icons-material";
import { BASE_URL } from "../config/config";
import UserDetailFieldModal from "./UserDetailsModal";

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

  const [userDetails, setUserDetails] = useState<boolean>(false);
  const { data, isLoading, isError, error, isFetching } = useQuery({
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
          onClick={() => setUserDetails(true)}
          disabled={isFetching}
        >
          User Details
        </Button>
      </Stack>
      {examId &&
        <UserDetailFieldModal refresh={() => { queryClient.invalidateQueries({queryKey:['exam',examId]})}} examId={examId as string} open={userDetails} onClose={() => { setUserDetails(false) }} userDetails={data.userDetails} />
      }
      {data && (
        <>
          <ExamMeta examId={examId} data={data} />
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
const ExamMeta = ({ data, examId }: any) => {
  const [formData, setData] = useState({
    name: data.name,
    isAvailable: data.isAvailable,
  });
  const [isSaving, setSaving] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (field: string, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await axios.post(`${BASE_URL}/api/campus/exam/update`, {
        examId,
        ...formData,
      });

      enqueueSnackbar("✅ Exam updated successfully", {
        variant: "success",
      });
    } catch (err: any) {
      const errorData = err.response?.data;

      if (errorData?.details?.length) {
        // Show main message first
        enqueueSnackbar(errorData.message || "❌ Update failed", {
          variant: "error",
        });

        // Then show each section-specific issue
        errorData.details.forEach((item: any) => {
          enqueueSnackbar(`Section "${item.section}": ${item.reason}`, {
            variant: "warning",
          });
        });
      } else {
        // Generic fallback
        enqueueSnackbar(errorData?.message || "❌ Update failed", {
          variant: "error",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      elevation={0}
      variant="outlined"
      sx={{ mt: 3, borderRadius: 3, p: 2 }}
    >
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
          startIcon={
            isSaving ? <CircularProgress size={18} color="inherit" /> : null
          }
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
        Add New Section
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
  const [editData, setEditData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [poolType, setPoolType] = useState<"question" | "problem" | null>(null);

  // NEW STATES FOR DELETE CONFIRM
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const handleOpen = (section: any) => {
    setSelectedSection(section);
    setEditData({ ...section });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedSection(null);
    setEditData(null);
  };

  const handleChange = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!editData || !selectedSection) return;
    setSaving(true);
    try {
      await axios.post(`${BASE_URL}/api/exam/update/sections`, {
        ...editData,
        examId: examId,
        sectionId: selectedSection._id,
      });

      enqueueSnackbar("Section updated successfully", { variant: "success" });
      await queryClient.invalidateQueries({ queryKey: ["exam", examId] });
      handleClose();
    } catch (err) {
      enqueueSnackbar("Failed to update section", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    try {
      await axios.post(`${BASE_URL}/api/exam/delete/sections`, {
        sectionId,
        examId,
      });

      await queryClient.invalidateQueries({ queryKey: ["exam", examId] });
      enqueueSnackbar("Section deleted successfully", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to delete section", { variant: "error" });
    }
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

      <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }} gap={3}>
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
              {/* DELETE ICON (opens dialog) */}
              <IconButton
                onClick={() => {
                  setDeleteId(section._id);
                  setConfirmDelete(true);
                }}
                sx={{ position: "absolute", top: 4, right: 36 }}
              >
                <Delete />
              </IconButton>

              {/* EDIT ICON */}
              <IconButton
                size="small"
                sx={{ position: "absolute", top: 8, right: 8 }}
                onClick={() => handleOpen(section)}
              >
                <Edit />
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

      {/* EDIT DIALOG */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Section Info</DialogTitle>
        <Divider />
        <DialogContent dividers>
          {editData ? (
            <Stack spacing={2}>
              <TextField
                label="Title"
                value={editData.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
                fullWidth
              />
              <TextField
                label="Description"
                value={editData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                fullWidth
                multiline
                rows={2}
              />
              <TextField
                label="Max Questions"
                type="number"
                value={editData.maxQuestion || ""}
                onChange={(e) => handleChange("maxQuestion", Number(e.target.value))}
                fullWidth
              />
              <TextField
                label="Max Time (min)"
                type="number"
                value={editData.maxTime || ""}
                onChange={(e) => handleChange("maxTime", Number(e.target.value))}
                fullWidth
              />
              <TextField
                label="Max Score"
                type="number"
                value={editData.maxScore || ""}
                onChange={(e) => handleChange("maxScore", Number(e.target.value))}
                fullWidth
              />
            </Stack>
          ) : (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Delete Section</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Are you sure you want to delete this section? This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>

          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (!deleteId) return;

              await handleDeleteSection(deleteId);
              setConfirmDelete(false);
              setDeleteId(null);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* POOL DIALOGS */}
      {poolType === "question" && selectedSection && (
        <AddQuestionPool
          open
          examId={examId}
          selectedQuestionId={selectedSection.questionPool}
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
          selectedProbIds={selectedSection.problemPool}
        />
      )}
    </Box>
  );
};



export const AddQuestionPool = ({
  open,
  onClose,
  data,
  examId,
  selectedQuestionId
}: {
  open: boolean;
  onClose: () => void;
  data: any;
  examId: string;
  selectedQuestionId: string
}) => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(
    selectedQuestionId
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;


  // Reset selection when reopened
  useEffect(() => {
    if (open) setSelectedPoolId(data.questionPool?._id || null);
  }, [open, data.questionPool]);

  // 🔹 Fetch all question pools (supports pagination + search)
  const { data: poolData, isLoading } = useQuery({
    queryKey: ["questionPools", examId, search, page],
    queryFn: async () => {
      const res = await axios.get(
        `${BASE_URL}/api/exam/questionbank/${id}?limit=${limit}&page=${page}&search=${search}`
      );
      return res.data; // expects { questions: [], total: number }
    },
    enabled: open,
  });

  // 🔹 Mutation to update selected pool
  const { mutate: updatePool, isPending } = useMutation({
    mutationFn: async () =>
      axios.post(
        `${BASE_URL}/api/exam/add/questionPool/${examId}/${data._id}`,
        { questionPoolId: selectedPoolId }
      ),
    onSuccess: () => {
      enqueueSnackbar("Question pool updated successfully", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
      onClose();
    },
    onError: () => {
      enqueueSnackbar("Failed to update pool", { variant: "error" });
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {data.questionPool
          ? `Update Question Pool for "${data.title}"`
          : `Add Question Pool to "${data.title}"`}
      </DialogTitle>

      <DialogContent dividers>
        {/* 🔍 Search Bar */}
        <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search question pools..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </Box>

        {/* 🧩 Pools List */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : poolData?.questions?.length ? (
          <>
            <List dense sx={{ maxHeight: 400, overflowY: "auto" }}>
              {poolData.questions.map((pool: any) => (
                <ListItemButton
                  key={pool._id}
                  selected={selectedPoolId === pool._id}
                  onClick={() => setSelectedPoolId(pool._id)}
                >
                  <Radio
                    checked={selectedPoolId === pool._id}
                    onChange={() => setSelectedPoolId(pool._id)}
                    value={pool._id}
                  />
                  <ListItemText
                    primary={pool.name}
                    secondary={`${pool.questions?.length || 0} questions`}
                  />
                </ListItemButton>
              ))}
            </List>

            {/* 📄 Pagination */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Pagination
                count={Math.ceil((poolData.total || 0) / limit)}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          </>
        ) : (
          <Typography color="text.secondary" align="center" py={2}>
            No question pools found
          </Typography>
        )}
      </DialogContent>

      {/* 🧭 Actions */}
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          disabled={!selectedPoolId || isPending}
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
  selectedProbIds = [],
}: {
  open: boolean;
  onClose: () => void;
  data: any;
  examId: string;
  selectedProbIds?: string[];
}) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [selectedProblems, setSelectedProblems] = useState<string[]>(selectedProbIds);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [difficulty, setDifficulty] = useState<string>("all");
  const limit = 10;

  useEffect(() => {
    // Update local state when dialog opens with passed IDs
    if (open) setSelectedProblems(selectedProbIds);
    console.log(selectedProbIds)
  }, [open, selectedProbIds]);

  const { data: problemData, isLoading } = useQuery({
    queryKey: ["problems", search, page, difficulty],
    queryFn: async () => {
      const res = await axios.get(
        `${BASE_URL}/api/exam/problems?limit=${limit}&page=${page}&search=${search}&isPublic=true&difficulty=${difficulty}`
      );
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
      enqueueSnackbar("Problem pool updated successfully", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
      onClose();
    },
    onError: () => {
      enqueueSnackbar("Failed to update problem pool", { variant: "error" });
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {data.problemPool?.length
          ? `Update Problems for "${data.title}"`
          : `Add Problems to "${data.title}"`}
      </DialogTitle>

      <DialogContent dividers>
        {/* Search Bar */}
        <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Select onChange={(e) => { setDifficulty(e.target.value) }} value={difficulty} title="Difficulty" size="small">
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="Easy">Easy</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Hard">Hard</MenuItem>
          </Select>
        </Box>

        {/* Problems List */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {problemData?.data?.length ? (
              <>
                <List dense>
                  {problemData.data.map((problem: any) => (
                    <ListItemButton
                      key={problem._id}
                      selected={selectedProblems.includes(problem._id)}
                      onClick={() => toggleSelect(problem._id)}
                    >
                      <ListItemText
                        primary={problem.title}
                        secondary={`Difficulty: ${problem.difficulty || "N/A"} | Tags: ${problem.tags?.join(", ") || "None"
                          }`}
                      />
                      <Checkbox checked={selectedProblems.includes(problem._id)} />
                    </ListItemButton>
                  ))}
                </List>

                {/* Pagination */}
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Pagination
                    count={Math.ceil(problemData.total / limit)}
                    page={page}
                    onChange={(_, newPage) => setPage(newPage)}
                    color="primary"
                  />
                </Box>
              </>
            ) : (
              <Typography color="text.secondary" align="center" py={2}>
                No problems found
              </Typography>
            )}
          </>
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