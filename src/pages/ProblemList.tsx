import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Chip,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BASE_URL } from "../config/config";

interface Problem {
  _id: string;
  title: string;
  isAvailable: boolean;
  isPublic: boolean;
  visibility: string;
  createdAt: string;
}

export default function ProblemList() {
  const navigate = useNavigate();

  // ---------------- URL STATE ----------------
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const query = searchParams.get("search") || "";

  // ---------------- LOCAL UI STATE ----------------
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // Delete dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const limit = 10;

  // ---------------- API ----------------
  const fetchProblems = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/api/campus/problems/get/getall`,
        {
          params: {
            page,
            limit,
            search: query,
          },
        }
      );

      setProblems(res.data.problems || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching problems:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProblem = async (id: string) => {
    try {
      await axios.delete(`${BASE_URL}/api/campus/problem/${id}`);
      fetchProblems();
    } catch (e) {
      console.error(e);
    }
  };

  // ---------------- EFFECT ----------------
  useEffect(() => {
    const debounce = setTimeout(fetchProblems, 400);
    return () => clearTimeout(debounce);
  }, [page, query]);

  // ---------------- HANDLERS ----------------
  const handleEdit = (id: string) => {
    navigate(`${id}`);
  };

  const handleCreate = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/api/campus/create-problem`);
      navigate(`${res.data.problemId}`);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePageChange = (_: any, value: number) => {
    setSearchParams({
      page: value.toString(),
      search: query,
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchParams({
      page: "1",
      search: value,
    });
  };

  // ---------------- UI ----------------
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Problems
        </Typography>

        <Button
          variant="contained"
          onClick={handleCreate}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          + Create Problem
        </Button>
      </Box>

      {/* Search */}
      <TextField
      size="small"
        fullWidth
        placeholder="Search problems..."
        value={query}
        onChange={(e) => handleSearchChange(e.target.value)}
        sx={{ mb: 3 }}
      />

      {/* Loading */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Visibility</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Created At</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {problems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No problems found.
                    </TableCell>
                  </TableRow>
                ) : (
                  problems.map((problem) => (
                    <TableRow key={problem._id} hover>
                      <TableCell>{problem.title}</TableCell>
                      <TableCell>{problem.visibility || "—"}</TableCell>
                      <TableCell>
                        {problem.isAvailable || problem.isPublic ? (
                          <Chip label="Published" color="success" size="small" />
                        ) : (
                          <Chip label="Draft" color="warning" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(problem.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(problem._id)}
                        >
                          <Edit />
                        </IconButton>

                        <IconButton
                          color="error"
                          onClick={() => {
                            setDeleteId(problem._id);
                            setConfirmOpen(true);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
            />
          </Box>
        </>
      )}

      {/* Delete Confirmation */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete Problem</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this problem?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (deleteId) await deleteProblem(deleteId);
              setConfirmOpen(false);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
