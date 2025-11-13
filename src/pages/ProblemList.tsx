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
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const limit = 10;

  const fetchProblems = async (pageNumber: number) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/api/campus/problems/get/getall?page=${pageNumber}&limit=${limit}`
      );
      setProblems(res.data.problems || []);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Error fetching problems:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems(page);
  }, [page]);

  const handleEdit = (id: string) => {
    navigate(`${id}`);
  };

  const handleCreate = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/api/campus/create-problem`);
      navigate(`${res.data.problemId}`);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePageChange = (_: any, value: number) => {
    setPage(value);
  };

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
          color="primary"
          onClick={handleCreate}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          + Create Problem
        </Button>
      </Box>

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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Control */}
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
    </Box>
  );
}
