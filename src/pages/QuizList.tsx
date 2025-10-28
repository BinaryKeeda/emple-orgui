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
  TablePagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Snackbar,
  Alert,
} from '@mui/material'
import { Search, Visibility, Edit, Delete } from '@mui/icons-material'
import { useQuery, useQueryClient } from '@tanstack/react-query'

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

const fetchQuizzes = async ({
  sectionId,
  page,
  limit,
  search,
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
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  const [openDialog, setOpenDialog] = useState(false)
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null)

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  })

  const queryClient = useQueryClient()

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(0)
    }, 400)
    return () => clearTimeout(handler)
  }, [search])

  const { data, isLoading } = useQuery({
    queryKey: ['quizzes', id, page, rowsPerPage, debouncedSearch],
    queryFn: () =>
      fetchQuizzes({
        sectionId: id as string,
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearch,
      }),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })

  const quizzes = data?.quizzes ?? []
  const totalQuizzes = data?.totalQuizzes ?? 0

  const handleChangePage = (_: any, newPage: number) => setPage(newPage)
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleDeleteConfirm = (quiz: Quiz) => {
    setQuizToDelete(quiz)
    setOpenDialog(true)
  }

  const handleDelete = async () => {
    if (!quizToDelete) return

    try {
      await axios.delete(`${BASE_URL}/api/campus/sections/quiz/delete/${quizToDelete._id}`, {
        withCredentials: true,
      })

      setSnackbar({
        open: true,
        message: 'Quiz deleted successfully',
        severity: 'success',
      })

      queryClient.invalidateQueries({
        queryKey: ['quizzes', id, page, rowsPerPage, debouncedSearch],
      })
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to delete quiz',
        severity: 'error',
      })
    } finally {
      setOpenDialog(false)
      setQuizToDelete(null)
    }
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 3, overflow: 'hidden' }}>
      <TextField
        size='small'
        placeholder='Search quizzes...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, width: '100%', maxWidth: 400 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <Search />
            </InputAdornment>
          ),
        }}
      />

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
              <TableCell align='center'>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} align='center'>
                  Loading...
                </TableCell>
              </TableRow>
            ) : quizzes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align='center'>
                  No quizzes found.
                </TableCell>
              </TableRow>
            ) : (
              quizzes.map((quiz) => (
                <TableRow key={quiz._id} hover>
                  <TableCell>{quiz.title}</TableCell>
                  <TableCell>{quiz.category}</TableCell>
                  <TableCell>{quiz.difficulty}</TableCell>
                  <TableCell>{quiz.duration} min</TableCell>
                  <TableCell>{quiz.marks}</TableCell>
                  <TableCell>{quiz.creator?.name || '-'}</TableCell>
                  <TableCell>
                    <Tooltip
                      title={`Total: ${quiz.costPerAttempt * quiz.noOfSubmissions}`}
                      arrow
                    >
                      <span>
                        {(quiz.costPerAttempt || 0) * (quiz.noOfSubmissions || 0)}
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
                  <TableCell align='center'>
                    <Tooltip title='Delete Quiz'>
                      <IconButton
                        color='error'
                        size='small'
                        onClick={() => handleDeleteConfirm(quiz)}
                      >
                        <Delete fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component='div'
        count={totalQuizzes}
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
            Are you sure you want to delete quiz "{quizToDelete?.title}"? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color='inherit'>
            Cancel
          </Button>
          <Button onClick={handleDelete} color='error' variant='contained'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  )
}

export default QuizEdit
