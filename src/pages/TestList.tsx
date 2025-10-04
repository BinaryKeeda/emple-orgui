import React, { useState } from "react";
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
} from "@mui/material";
import { Search, Visibility, Edit } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";

interface Test {
  _id: string;
  name: string;
  title?: string;
  category: string;
  duration: number;
  creator?: {
    name:string
  }
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

// Fetch tests
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

const TestList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState(0); // 0-based for MUI TablePagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["tests", id, page, rowsPerPage, search],
    queryFn: () =>
      fetchTests({ sectionId: id as string, page: page + 1, limit: rowsPerPage, search }),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  const tests: Test[] = data?.tests ?? [];
  const total: number = data?.totalTests ?? 0;

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      {/* Search */}
      <TextField
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        placeholder="Search tests..."
        sx={{ mb: 2, width: "100%", maxWidth: 360 }}
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
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : tests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No Tests found.
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
                    {test.costPerAttempt  ? (
                      <Tooltip
                        title={`Total: ${test.costPerAttempt} * ${test.noOfSubmissions}`}
                        arrow
                      >
                        <span>
                          {test.costPerAttempt *( test.noOfSubmissions || 0)}
                        </span>
                      </Tooltip>
                    ) : "-"}
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
                        to={`preview/${test._id}`}
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 20, 50]}
      />
    </Paper>
  );
};

export default TestList;
