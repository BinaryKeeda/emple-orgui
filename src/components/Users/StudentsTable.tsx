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
  Box
} from '@mui/material'
import { Delete, Search } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

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
  // const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  const limit = 10
  const { id: sectionId } = useParams<{ id: string }>()

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
      fetchStudents(sectionId as string, page, limit, debouncedSearch, "all", status),
  })

  const handleRemove = async (userId: string) => {
    try {
      await axios.delete(`${BASE_URL}/api/campus/students/${sectionId}/${userId}`, {
        withCredentials: true,
      })
      refetch()
    } catch (err) {
      console.error('Failed to remove student', err)
    }
  }

  const students: User[] = data?.data || []
  const total: number = data?.total || 0

  return (
    <div className='space-y-4'>
      {/* 🔍 Search + Filters */}
      <Box display='flex' flexWrap='wrap' gap={2} alignItems='center'>
        {/* Search */}
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

        {/* Role Filter */}
        {/* <FormControl size='small' sx={{ minWidth: 160 }}>
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            <MenuItem value='all'>All Roles</MenuItem>
            <MenuItem value='user'>Members</MenuItem>
            <MenuItem value='admin'>Admins</MenuItem>
            <MenuItem value='invitee'>Invitees</MenuItem>
          </Select>
        </FormControl> */}

        {/* Status Filter */}
        <FormControl size='small' sx={{ minWidth: 160 }}>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value='all'>All Statuses</MenuItem>
            <MenuItem value='member'>Member</MenuItem>
            <MenuItem value='pending'>Pending</MenuItem>
            <MenuItem value='admin'>Admin</MenuItem>
          </Select>
        </FormControl>
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
                      <Tooltip title='Remove Student'>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() => handleRemove(user._id)}
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
    </div>
  )
}

export default StudentsTable
