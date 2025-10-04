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
  InputAdornment
} from '@mui/material'
import { Delete, Search } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'

// -------------------- Types --------------------
interface StudentsTableProps {
  sectionId: string
}

interface User {
  _id: string
  name: string
  email: string
  role: string
  status: 'member' | 'pending'
  createdBy?: string
  costPerTest?: number
  noOfSubmissions?: number
}

// -------------------- Fetch Function --------------------
const fetchStudents = async (
  sectionId: string,
  groupId: string | undefined,
  page: number,
  limit: number,
  search: string
) => {
  const res = await axios.get(
    `${BASE_URL}/api/campus/students/${sectionId}/${groupId}?page=${page}&limit=${limit}&search=${search}`,
    { withCredentials: true }
  )
  return res.data
}

// -------------------- StudentsTable --------------------
const StudentsTable: React.FC<StudentsTableProps> = ({ sectionId }) => {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [page, setPage] = useState(1)
  const limit = 10
  const groupId = "";

  // -------------------- Debounce search input --------------------
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // reset page on search
    }, 400) // 400ms debounce
    return () => clearTimeout(handler)
  }, [search])

  // -------------------- React Query --------------------
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['students', sectionId, groupId, page, debouncedSearch],
    queryFn: () =>
      fetchStudents(sectionId, groupId, page, limit, debouncedSearch),
    enabled: !!sectionId && !!groupId
  })

  const handleRemove = async (userId: string) => {
    try {
      await axios.delete(
        `${BASE_URL}/api/campus/students/${sectionId}/${userId}`,
        { withCredentials: true }
      )
      refetch()
    } catch (err) {
      console.error('Failed to remove student', err)
    }
  }

  // if (isLoading) return <div className="p-5">Loading...</div>;

  const students: User[] = data?.data || []
  const total: number = data?.total || 0

  return (
    <div className='space-y-4'>
      {/* Search */}
      <TextField
        value={search}
        onChange={e => setSearch(e.target.value)}
        size='small'
        label='Search by name or email'
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <IconButton size='small' edge='start'>
                <Search />
              </IconButton>
            </InputAdornment>
          )
        }}
        sx={{ maxWidth: 320 }}
      />

      {/* Table */}
      {isLoading ? (
        <></>
      ) : (
        <>
          <TableContainer component={Paper} className='shadow mt-10 rounded-lg'>
            <Table>
              <TableHead className='bg-orange-50'>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  {/* <TableCell>Created By</TableCell> */}
                  {/* <TableCell>Cost</TableCell> */}
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align='center'>
                      <Typography color='textSecondary'>
                        No students found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {students.map(user => (
                  <TableRow
                    key={user._id}
                    hover
                    className='transition duration-150 ease-in-out'
                  >
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      {user.status === 'member' ? (
                        <span className='px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded'>
                          Member
                        </span>
                      ) : (
                        <span className='px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded'>
                          Pending
                        </span>
                      )}
                    </TableCell>
                    {/* <TableCell>{user.createdBy || '-'}</TableCell> */}
                    {/* <TableCell>
                      {user.costPerTest && user.noOfSubmissions ? (
                        <Tooltip
                          title={`Total: ${
                            user.costPerTest * user.noOfSubmissions
                          }`}
                          arrow
                        >
                          <IconButton size='small'>
                            <InfoOutlined />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        '-'
                      )}
                    </TableCell> */}
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

          {/* Pagination */}
          <div className='flex justify-between items-center mt-2'>
            <Typography variant='body2' color='textSecondary'>
              Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)}{' '}
              of {total}
            </Typography>
            <div className='flex gap-2'>
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className='px-3 py-1 border rounded disabled:opacity-50'
              >
                Prev
              </button>
              <button
                disabled={page * limit >= total}
                onClick={() => setPage(p => p + 1)}
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
