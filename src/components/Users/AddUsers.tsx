import React, { useState, useMemo } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { type RootState } from "../../store/store";
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  Box,
  CircularProgress,
  Typography,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material"; // ✅ added Snackbar + Alert
import { UploadFile, Download, Delete, Close } from "@mui/icons-material";
import * as XLSX from "xlsx";
import { BASE_URL } from "../../config/config";
import { getGroupOwnerShip } from "../../store/selectros/userSelector";
import { useSnackbar } from "notistack";

interface UserData {
  email: string;
  name: string;
  role: "user" | "campus-admin";
}

interface AddUsersProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function AddUsers({ open, setOpen }: AddUsersProps) {
  const [usersData, setUsersData] = useState<UserData[]>([]);
  const [response, setResponse] = useState<any>(null);
  console.log(response);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState<string>("");

  // ✅ New states for API loading + snackbar
  const [submitting, setSubmitting] = useState(false);


  const admin = useSelector((s: RootState) => s.auth.user);
  const adminId = admin?.user._id;
  const { id: sectionId } = useParams<{ id: string }>();
  const groupId = useSelector(getGroupOwnerShip);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const { enqueueSnackbar } = useSnackbar()
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (usersData.length === 0) {
      setError("Please add at least one valid email");
      return;
    }

    const adminCount = usersData.filter((u) => u.role === "campus-admin").length;
    if (adminCount > 5) {
      setError("You can only invite up to 5 campus-admins at a time.");
      return;
    }

    setSubmitting(true); // ✅ show loader
    // setSnackbar({
    //   open: true,
    //   message: "Processing invites...",
    //   severity: "info",
    // });
    enqueueSnackbar("Processing invites...", {
      variant: "info"
    })

    try {
      const invites = usersData.map((u) => ({
        email: u.email,
        name: u.name || "Unknown",
        role: u.role,
        groupId,
        sectionId,
        invitedBy: adminId,
      }));

      const res = await axios.post(
        `${BASE_URL}/api/campus/section/add`,
        { invites },
        { withCredentials: true }
      );

      setResponse(res.data);
      setUsersData([]);
      setError(null);

      // ✅ Success snackbar
      // setSnackbar({
      //   open: true,
      //   message: "Invites sent successfully!",
      //   severity: "success",
      // });
      enqueueSnackbar("Invite send successfully", {
        variant: "success"
      })
      setOpen(false)

    } catch (err: any) {
      setResponse({ error: err.response?.data || err.message });
      enqueueSnackbar("Error sending", {
        variant: "success"
      })
    } finally {
      setSubmitting(false);
    }
  };

  // --- Add new row ---
  const handleAddRow = () => {
    setUsersData((prev) => [...prev, { email: "", name: "", role: "user" }]);
  };

  // --- Excel Upload ---
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingExcel(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet) as any[];

      const newUsers: UserData[] = json
        .map((row) => ({
          email: row.Email?.trim(),
          name: row.Name?.trim() || "Unknown",
          role:
            row.Role && ["user", "campus-admin"].includes(row.Role)
              ? (row.Role as "user" | "campus-admin")
              : "user",
        }))
        .filter(
          (u) =>
            u.email &&
            emailRegex.test(u.email) &&
            !usersData.some((x) => x.email === u.email)
        );

      if (newUsers.length === 0) {
        setError("No valid users found in file");
      } else {
        setUsersData((prev) => [...prev, ...newUsers]);
        setError(null);
      }
      setLoadingExcel(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDownloadSample = () => {
    const sampleData = [
      { Name: "John Doe", Email: "user1@example.com", Role: "user" },
      { Name: "Jane Smith", Email: "user2@example.com", Role: "campus-admin" },
    ];
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "sample_users.xlsx");
  };

  // --- Editable fields ---
  const handleEdit = (index: number, field: keyof UserData, value: string) => {
    const updated = [...usersData];
    updated[index][field] = value as any;
    setUsersData(updated);
  };

  // --- Delete user ---
  const handleDelete = (index: number) => {
    const updated = [...usersData];
    updated.splice(index, 1);
    setUsersData(updated);
  };

  // --- Search filtering ---
  const filteredUsers = useMemo(() => {
    if (!search) return usersData;
    return usersData.filter(
      (u) =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, usersData]);

  return (
    <>
      <Dialog
        maxWidth="xl"
        fullWidth
        open={open}
        onClose={() => setOpen(false)}
        fullScreen={fullScreen}
        PaperProps={{ sx: { p: 3, height: fullScreen ? "100%" : "90vh" } }}
      >
        <DialogContent className="flex flex-col gap-3" sx={{ overflowY: "auto" }}>
          <Typography variant="h5" mb={2} align="center">
            Add Members
          </Typography>
          <IconButton onClick={() => setOpen(false)} sx={{ position: "absolute", right: 5, top: 3 }}>
            <Close />
          </IconButton>

          {/* Search bar */}
          <TextField
            size="small"
            fullWidth
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2 }}
          />

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {error && <FormHelperText error>{error}</FormHelperText>}

            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<UploadFile />}
                component="label"
                disabled={loadingExcel}
              >
                {loadingExcel ? <CircularProgress size={18} /> : "Upload"}
                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls,.csv"
                  onChange={handleExcelUpload}
                />
              </Button>

              <Button
                variant="outlined"
                size="small"
                startIcon={<Download />}
                onClick={handleDownloadSample}
              >
                Sample
              </Button>

              <Button variant="outlined" size="small" onClick={handleAddRow}>
                Add +
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((user, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={user.email}
                              onChange={(e) =>
                                handleEdit(
                                  page * rowsPerPage + idx,
                                  "email",
                                  e.target.value
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              fullWidth
                              value={user.name}
                              onChange={(e) =>
                                handleEdit(
                                  page * rowsPerPage + idx,
                                  "name",
                                  e.target.value
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              fullWidth
                              size="small"
                              value={user.role}
                              onChange={(e) =>
                                handleEdit(
                                  page * rowsPerPage + idx,
                                  "role",
                                  e.target.value as "user" | "campus-admin"
                                )
                              }
                            >
                              <MenuItem value="user">User</MenuItem>
                              <MenuItem value="campus-admin">
                                Campus Admin
                              </MenuItem>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              color="error"
                              onClick={() =>
                                handleDelete(page * rowsPerPage + idx)
                              }
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No users added yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {filteredUsers.length > 0 && (
                <TablePagination
                  component="div"
                  count={filteredUsers.length}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              )}
            </TableContainer>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={submitting} // ✅ prevent multiple clicks
            >
              {submitting ? (
                <>
                  <CircularProgress size={18} sx={{ mr: 1 }} />
                  Processing...
                </>
              ) : (
                "Send Invites"
              )}
            </Button>
          </form>

          {/* {response && (
            <pre
              style={{
                marginTop: 12,
                padding: 10,
                background: "#f5f5f5",
                borderRadius: 6,
                maxHeight: 150,
                overflow: "auto",
              }}
            >
              {JSON.stringify(response, null, 2)}
            </pre>
          )} */}
        </DialogContent>
      </Dialog>

      {/* ✅ Snackbar */}

    </>
  );
}
