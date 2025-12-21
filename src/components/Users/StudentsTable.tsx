import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BASE_URL } from '../../config/config'
import {
  TextField,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Typography,
  InputAdornment,
  MenuItem,
  FormControl,
  Select,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material'
import { Delete, Search, Edit, Visibility, VisibilityOff } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store/store'

// -------------------- User Interface --------------------
interface User {
  _id: string
  name: string
  email: string
  role: string
  status: 'member' | 'pending' | 'admin'
  createdBy?: string
  costPerTest?: number
  noOfSubmissions?: number
}

// -------------------- Fetch Function --------------------
const fetchStudents = async (
  sectionId: string,
  page: number,
  limit: number,
  search: string,
  role: string,
  status: string
) => {
  const res = await axios.get(
    `${BASE_URL}/api/campus/students/${sectionId}?page=${page}&limit=${limit}&search=${search}&role=${role}&status=${status}`,
    { withCredentials: true }
  )
  return res.data
}

// -------------------- StudentsTable --------------------
const StudentsTable: React.FC = () => {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('all')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [deleteStatus, setDeleteStatus] = useState<string>('invite')
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const limit = 10
  const { id: sectionId } = useParams<{ id: string }>()
  const { enqueueSnackbar } = useSnackbar()
  const user = useSelector((s: RootState) => s.auth.user)

  // -------------------- Debounce Search --------------------
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(handler)
  }, [search])

  // -------------------- React Query --------------------
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['students', sectionId, page, debouncedSearch, status],
    queryFn: () =>
      fetchStudents(sectionId as string, page, limit, debouncedSearch, 'all', status),
  })

  // -------------------- Delete Confirmation --------------------
  const handleRemoveClick = (userId: string, userStatus: string) => {
    setSelectedUserId(userId)
    const mapped =
      userStatus === 'member' || userStatus === 'admin'
        ? userStatus
        : 'invite'
    setDeleteStatus(mapped)
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedUserId) return

    try {
      await axios.delete(
        `${BASE_URL}/api/campus/students/${sectionId}/${selectedUserId}?status=${deleteStatus}`,
        { withCredentials: true }
      )

      enqueueSnackbar('Student removed successfully!', { variant: 'success' })
      refetch()
    } catch (err) {
      console.error('Failed to remove student', err)
      enqueueSnackbar('Failed to remove student!', { variant: 'error' })
    } finally {
      setConfirmOpen(false)
      setSelectedUserId(null)
    }
  }

  // -------------------- Password Change --------------------
  const handlePasswordClick = (user: User) => {
    setSelectedUser(user)
    setNewPassword('')
    setShowPassword(false)
    setPasswordModalOpen(true)
  }

  const confirmPasswordChange = async () => {
    if (!selectedUser) return

    // Validation
    if (!newPassword.trim()) {
      enqueueSnackbar('Password cannot be empty', { variant: 'warning' })
      return
    }

    if (newPassword.length < 6) {
      enqueueSnackbar('Password must be at least 6 characters', { variant: 'warning' })
      return
    }

    setPasswordLoading(true)

    try {
      await axios.put(
        `${BASE_URL}/api/campus/students/${selectedUser._id}/password`,
        { password: newPassword },
        { withCredentials: true }
      )

      enqueueSnackbar('Password updated successfully!', { variant: 'success' })
      setPasswordModalOpen(false)
      setSelectedUser(null)
      setNewPassword('')
      refetch()
    } catch (err: any) {
      console.error('Failed to update password', err)
      const errorMsg =
        err.response?.data?.message || 'Failed to update password'
      enqueueSnackbar(errorMsg, { variant: 'error' })
    } finally {
      setPasswordLoading(false)
    }
  }

  const students: User[] = data?.data || []
  const total: number = data?.total || 0

  return (
    <div className='space-y-4'>
      {/* 🔍 Search + Filters */}
      <Box display='flex' flexWrap='wrap' gap={2} alignItems='center'>
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size='small'
          label='Search by name or email'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 280 }}
        />

        {user?.user.role == 'campus-superadmin' && (
          <FormControl size='small' sx={{ minWidth: 160 }}>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value='all'>All</MenuItem>
              <MenuItem value='member'>Member</MenuItem>
              <MenuItem value='pending'>Pending</MenuItem>
              <MenuItem value='admin'>Admin</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>

      {/* 🧾 Table */}
      {isLoading ? (
        <Typography>Loading...</Typography>
      ) : (
        <>
          <TableContainer component={Paper} className='shadow mt-6 rounded-lg'>
            <Table>
              <TableHead className='bg-orange-50'>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align='center'>
                      <Typography color='textSecondary'>No students found</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {students.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      {user.status === 'member' ? (
                        <span className='px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded'>
                          Member
                        </span>
                      ) : user.status === 'admin' ? (
                        <span className='px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded'>
                          Admin
                        </span>
                      ) : (
                        <span className='px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded'>
                          Pending
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title='Change Password'>
                        <IconButton
                          size='small'
                          color='primary'
                          onClick={() => handlePasswordClick(user)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Remove Student'>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() => handleRemoveClick(user._id, user.status)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 🔢 Pagination */}
          <div className='flex justify-between items-center mt-3'>
            <Typography variant='body2' color='textSecondary'>
              Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total}
            </Typography>
            <div className='flex gap-2'>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className='px-3 py-1 border rounded disabled:opacity-50'
              >
                Prev
              </button>
              <button
                disabled={page * limit >= total}
                onClick={() => setPage((p) => p + 1)}
                className='px-3 py-1 border rounded disabled:opacity-50'
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* ⚠️ Confirm Delete Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Removal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this student? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color='error' onClick={confirmDelete}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔐 Password Change Dialog */}
      <Dialog open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent className='pt-6'>
          <Typography variant='body2' color='textSecondary' className='mb-4'>
            Updating password for: <strong>{selectedUser?.name}</strong>
          </Typography>
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label='New Password'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin='normal'
            placeholder='Enter new password (min 6 characters)'
            variant='outlined'
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge='end'
                    size='small'
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setPasswordModalOpen(false)}
            disabled={passwordLoading}
          >
            Cancel
          </Button>
          <Button
            color='primary'
            variant='contained'
            onClick={confirmPasswordChange}
            disabled={passwordLoading}
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default StudentsTable