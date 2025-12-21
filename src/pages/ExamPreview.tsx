import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { CloudDownload, Delete, Visibility, Info } from "@mui/icons-material";

// ---------------------------
// Interfaces
// ---------------------------
interface User {
  name: string;
  email: string;
}
interface Submission {
  _id: string;
  userId: string;
  testId: string;
  currSection: number;
  ufmAttempts: number;
  hasAgreed: boolean;
  isSubmitted: boolean;
  isEvaluated: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
  score?: number;
  attemptNo?: number;
}



interface Defaulter {
  _id: string;
  name: string;
  email: string;
}

interface ApiResponse {
  submissions: Submission[];
  total: number;
  totalPages: number;
  defaulters: {
    list: Defaulter[];
    total: number;
    totalPages: number;
  };
  currentPage: number;
}

// ---------------------------
// Debounce Hook
// ---------------------------
const useDebounce = (value: string, delay = 500) => {
  const [debounced, setDebounced] = useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
};

// ---------------------------
// Info Modal Component
// ---------------------------
const InfoModal: React.FC<{
  open: boolean;
  onClose: () => void;
  submission: Submission | null;
  onSave?: (updated: Submission) => void;
}> = ({ open, onClose, submission, onSave }) => {
  const [editData, setEditData] = useState<Submission | null>(submission);

  React.useEffect(() => {
    setEditData(submission);
  }, [submission]);

  if (!editData) return null;

  const handleFieldChange = (field: any, value: any) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleSave = () => {
    if (editData && onSave) {
      onSave(editData);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Submission Details</DialogTitle>
      <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Submission ID"
          value={editData._id}
          disabled
          fullWidth
          size="small"
        />
        <TextField
          label="User ID"
          value={editData.userId}
          disabled
          fullWidth
          size="small"
        />
        <TextField
          label="Test ID"
          value={editData.testId}
          disabled
          fullWidth
          size="small"
        />
        <TextField
          label="User Name"
          value={editData.user.name}
          disabled
          fullWidth
          size="small"
        />
        <TextField
          label="User Email"
          value={editData.user.email}
          disabled
          fullWidth
          size="small"
        />
        <TextField
          label="Current Section"
          type="number"
          value={editData.currSection}
          onChange={(e) => handleFieldChange("currSection", parseInt(e.target.value))}
          fullWidth
          size="small"
        />
        <TextField
          label="UFM Attempts"
          type="number"
          value={editData.ufmAttempts}
          onChange={(e) => handleFieldChange("ufmAttempts", parseInt(e.target.value))}
          fullWidth
          size="small"
        />
        <Box sx={{ display: "flex", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <label className="text-sm font-medium">Has Agreed</label>
            <select
              value={editData.hasAgreed ? "true" : "false"}
              onChange={(e) => handleFieldChange("hasAgreed", e.target.value === "true")}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </Box>
          <Box sx={{ flex: 1 }}>
            <label className="text-sm font-medium">Is Submitted</label>
            <select
              value={editData.isSubmitted ? "true" : "false"}
              onChange={(e) => handleFieldChange("isSubmitted", e.target.value === "true")}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <label className="text-sm font-medium">Is Evaluated</label>
            <select
              value={editData.isEvaluated ? "true" : "false"}
              onChange={(e) => handleFieldChange("isEvaluated", e.target.value === "true")}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </Box>
        </Box>
        <TextField
          label="Created At"
          value={new Date(editData.createdAt).toLocaleString()}
          disabled
          fullWidth
          size="small"
        />
        <TextField
          label="Updated At"
          value={new Date(editData.updatedAt).toLocaleString()}
          disabled
          fullWidth
          size="small"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ---------------------------
// Main Component
// ---------------------------
const ExamPreview: React.FC = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const [email, setEmail] = useState("");
  const debouncedEmail = useDebounce(email, 400);

  const [infoOpen, setInfoOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // ---------------------------
  // Memoized Fetch Function
  // ---------------------------
  const fetchExamPreview = useMemo(
    () => async () => {
      const res = await axios.get<ApiResponse>(
        `${BASE_URL}/api/exam/getall/submissions/${slug}?page=${page}&limit=10&query=${debouncedEmail}`,
        { withCredentials: true }
      );
      return res.data;
    },
    [slug, page, debouncedEmail]
  );

  // ---------------------------
  // React Query
  // ---------------------------
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["examPreview", slug, page, debouncedEmail],
    queryFn: fetchExamPreview,
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // ---------------------------
  // Excel Download Handler
  // ---------------------------
  const handleDownloadExcel = async () => {
    if (!slug || !id) return;

    setDownloading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/campus/exam/sections/download/${slug}/${id}`,
        {
          responseType: "blob",
          withCredentials: true,
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `exam_submissions_${slug}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      enqueueSnackbar("Excel exported successfully!", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to export Excel", { variant: "error" });
    } finally {
      setDownloading(false);
    }
  };

  // ---------------------------
  // Info Button Handler
  // ---------------------------
  const handleOpenInfo = (submission: Submission) => {
    setSelectedSubmission(submission);
    setInfoOpen(true);
  };

  const handleSaveInfo = async (updated: Submission) => {
    try {
      await axios.put(
        `${BASE_URL}/api/campus/submission/${updated._id}`,
        updated,
        { withCredentials: true }
      );
      enqueueSnackbar("Submission updated successfully!", { variant: "success" });
      refetch();
    } catch (error) {
      enqueueSnackbar("Failed to update submission", { variant: "error" });
    }
  };

  // ---------------------------
  // Error State
  // ---------------------------
  if (isError)
    return (
      <div className="text-center py-10 text-red-500">
        Failed to fetch exam data.
        <button
          onClick={() => refetch()}
          className="ml-2 underline text-indigo-600"
        >
          Retry
        </button>
      </div>
    );

  const submissions = data?.submissions ?? [];
  const totalPages = data?.totalPages ?? 1;

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="p-6 flex flex-col gap-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Exam Submissions</h2>

        <Button
          variant="contained"
          color="success"
          onClick={handleDownloadExcel}
          disabled={downloading}
          startIcon={
            downloading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <CloudDownload />
            )
          }
        >
          {downloading ? "Exporting..." : "Download Excel"}
        </Button>
      </div>

      {/* Search */}
      <TextField
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setPage(1);
        }}
        label="Search by Email"
        fullWidth
      />

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="w-full text-sm text-left border border-gray-200">
          <thead className="bg-gray-50 text-gray-700 text-sm">
            <tr>
              <th className="px-4 py-3 border-b">Name</th>
              <th className="px-4 py-3 border-b">Email</th>
              <th className="px-4 py-3 border-b">Details</th>
              <th className="px-4 py-3 border-b">Attempt</th>
              <th className="px-4 py-3 border-b">Submitted At</th>
              <th className="px-4 py-3 border-b">Delete</th>
            </tr>
          </thead>

          <tbody>
            {!isLoading && submissions.length > 0 ? (
              submissions.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 border-b">{s?.user?.name}</td>
                  <td className="px-4 py-4 border-b">{s?.user?.email}</td>

                  <td className="px-4 py-4 border-b">
                    <IconButton
                      onClick={() => handleOpenInfo(s)}
                      color="info"
                      size="small"
                      title="View & Edit Details"
                    >
                      <Info fontSize="small" />
                    </IconButton>
                  </td>

                  <td className="px-4 py-4 border-b">
                    <Link to={s._id}>
                      <IconButton size="small">
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Link>
                  </td>

                  <td className="px-4 py-4 border-b">
                    {new Date(s.updatedAt).toLocaleString()}
                  </td>

                  <td className="px-4 py-4 border-b">
                    <IconButton
                      onClick={async () => {
                        await axios.delete(
                          `${BASE_URL}/api/campus/submission/${s._id}`,
                          { withCredentials: true }
                        );
                        enqueueSnackbar("Submission deleted!", {
                          variant: "success",
                        });
                        refetch();
                      }}
                      color="error"
                      size="small"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  {isLoading ? (
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%", pt: "10px", justifyContent: "center" }}>
                      <CircularProgress size={20} />
                    </Box>
                  ) : (
                    "No submissions found."
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </p>

        <div className="space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 hover:bg-gray-100"
          >
            Prev
          </button>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      </div>

      {/* Info Modal */}
      <InfoModal
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        submission={selectedSubmission}
        onSave={handleSaveInfo}
      />
    </div>
  );
};

export default ExamPreview;