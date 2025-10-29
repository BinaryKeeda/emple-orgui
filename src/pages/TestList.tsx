import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config/config";
import {
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  TablePagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { Search, Visibility, Edit, Delete } from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// -------------------- Interfaces --------------------
interface Test {
  _id: string;
  name: string;
  title?: string;
  slug:string;
  category: string;
  duration: number;
  creator?: { name: string };
  costPerAttempt?: number;
  noOfSubmissions?: number;
  createdAt?: string;
}

interface PaginatedTests {
  success: boolean;
  page: number;
  limit: number;
  totalPages: number;
  totalTests: number;
  tests: Test[];
}

// -------------------- Fetch Function --------------------
const fetchTests = async ({
  sectionId,
  page,
  limit,
  search,
}: {
  sectionId: string;
  page: number;
  limit: number;
  search: string;
}) => {
  const res = await axios.get<PaginatedTests>(
    `${BASE_URL}/api/campus/test/get/section/${sectionId}`,
    { params: { page, limit, search }, withCredentials: true }
  );
  return res.data;
};

// -------------------- Component --------------------
const TestList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [openDialog, setOpenDialog] = useState(false);
  const [testToDelete, setTestToDelete] = useState<Test | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // -------------------- Debounce Search --------------------
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // -------------------- Query --------------------
  const { data, isLoading } = useQuery({
    queryKey: ["tests", id, page, rowsPerPage, debouncedSearch],
    queryFn: () =>
      fetchTests({
        sectionId: id as string,
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearch,
      }),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  const tests = data?.tests ?? [];
  const totalTests = data?.totalTests ?? 0;

  // -------------------- Pagination --------------------
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // -------------------- Delete Logic --------------------
  const handleDeleteConfirm = (test: Test) => {
    setTestToDelete(test);
    setOpenDialog(true);
  };

  const handleDelete = async () => {
    if (!testToDelete) return;

    try {
      await axios.delete(`${BASE_URL}/api/campus/test/delete/${testToDelete._id}`, {
        withCredentials: true,
      });

      setSnackbar({
        open: true,
        message: "Test deleted successfully",
        severity: "success",
      });

      // Invalidate cached data so table refreshes automatically
      queryClient.invalidateQueries({
        queryKey: ["tests", id, page, rowsPerPage, debouncedSearch],
      });
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Failed to delete test",
        severity: "error",
      });
    } finally {
      setOpenDialog(false);
      setTestToDelete(null);
    }
  };

  // -------------------- Render --------------------
  return (
    <Paper sx={{ p: 3, borderRadius: 3, overflow: "hidden" }}>
      {/* Search Field */}
      <TextField
        size="small"
        placeholder="Search tests..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, width: "100%", maxWidth: 400 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="center">Actions</TableCell>
              <TableCell align="center">Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : tests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No tests found.
                </TableCell>
              </TableRow>
            ) : (
              tests.map((test) => (
                <TableRow key={test._id} hover>
                  <TableCell>{test.name}</TableCell>
                  <TableCell>{test.category}</TableCell>
                  <TableCell>{test.duration} min</TableCell>
                  <TableCell>{test.creator?.name || "-"}</TableCell>
                  <TableCell>
                    {test.costPerAttempt ? (
                      <Tooltip
                        title={`Total: ${test.costPerAttempt} × ${test.noOfSubmissions}`}
                        arrow
                      >
                        <span>
                          {test.costPerAttempt * (test.noOfSubmissions || 0)}
                        </span>
                      </Tooltip>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {test.createdAt
                      ? new Date(test.createdAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Preview Test">
                      <IconButton
                        component={Link}
                        to={`preview/${test?.slug}`}
                        color="primary"
                        size="small"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Test">
                      <IconButton
                        component={Link}
                        to={`edit/${test._id}`}
                        color="warning"
                        size="small"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Delete Test">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteConfirm(test)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={totalTests}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 20, 50]}
      />

      {/* Confirm Delete Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete test "{testToDelete?.name}"? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default TestList;
