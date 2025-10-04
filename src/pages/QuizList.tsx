import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { BASE_URL } from '../config/config'
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
  TablePagination
} from '@mui/material'
import { Search, Visibility, Edit } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'

interface Quiz {
  _id: string
  title: string
  category: string
  difficulty: string
  duration: number
  marks: number
  createdAt: string
  slug: string
  createdBy?: string
  costPerAttempt: number
  cost: number
  noOfSubmissions: number
  creator: {
    _id: string
    name: string
    email: string
  }
}

interface PaginatedQuizzes {
  success: boolean
  page: number
  limit: number
  totalPages: number
  totalQuizzes: number
  quizzes: Quiz[]
}

// Fetch quizzes
const fetchQuizzes = async ({
  sectionId,
  page,
  limit,
  search
}: {
  sectionId: string
  page: number
  limit: number
  search: string
}) => {
  const res = await axios.get<PaginatedQuizzes>(
    `${BASE_URL}/api/campus/quiz/get/section/${sectionId}`,
    { params: { page, limit, search }, withCredentials: true }
  )
  return res.data
}

const QuizEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [page, setPage] = useState(0) // MUI TablePagination is 0-based
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(0) // reset page
    }, 400)
    return () => clearTimeout(handler)
  }, [search])

  const { data, isLoading } = useQuery({
    queryKey: ['quizzes', id, page, rowsPerPage, debouncedSearch],
    queryFn: () =>
      fetchQuizzes({
        sectionId: id as string,
        page: page + 1, // backend uses 1-based
        limit: rowsPerPage,
        search: debouncedSearch
      }),
    enabled: !!id,
    staleTime: 1000 * 60 * 5
  })

  const quizzes = data?.quizzes ?? []
  const totalQuizzes = data?.totalQuizzes ?? 0

  const handleChangePage = (_: any, newPage: number) => setPage(newPage)
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 3, overflow: 'hidden' }}>
      {/* Search */}
      <TextField
        size='small'
        placeholder='Search quizzes...'
        value={search}
        onChange={e => setSearch(e.target.value)}
        sx={{ mb: 2, width: '100%', maxWidth: 400 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <Search />
            </InputAdornment>
          )
        }}
      />

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Difficulty</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Marks</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell align='center'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align='center'>
                  Loading...
                </TableCell>
              </TableRow>
            ) : quizzes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align='center'>
                  No quizzes found.
                </TableCell>
              </TableRow>
            ) : (
              quizzes.map(quiz => (
                <TableRow key={quiz._id} hover>
                  <TableCell>{quiz.title}</TableCell>
                  <TableCell>{quiz.category}</TableCell>
                  <TableCell>{quiz.difficulty}</TableCell>
                  <TableCell>{quiz.duration} min</TableCell>
                  <TableCell>{quiz.marks}</TableCell>
                  <TableCell>{quiz.creator.name || '-'}</TableCell>
                  <TableCell>
                      <Tooltip
                        title={`Total: ${
                          quiz.costPerAttempt * quiz.noOfSubmissions
                        }`}
                        arrow
                      >
                        <span className='cursor-pointer'>
                          {/* {quiz.costPerAttempt} x {quiz.noOfSubmissions} */}
                          { (quiz.costPerAttempt || 0) * (quiz.noOfSubmissions || 0)}
                        </span>
                      </Tooltip>
                  </TableCell>
                  <TableCell align='center'>
                    <Tooltip title='Preview Quiz'>
                      <IconButton
                        component={Link}
                        to={`preview/${quiz.slug}`}
                        color='primary'
                        size='small'
                      >
                        <Visibility fontSize='small' />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title='Edit Quiz'>
                      <IconButton
                        component={Link}
                        to={`edit/${quiz._id}`}
                        color='warning'
                        size='small'
                      >
                        <Edit fontSize='small' />
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
        component='div'
        count={totalQuizzes}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 20, 50]}
      />
    </Paper>
  )
}

export default QuizEdit
