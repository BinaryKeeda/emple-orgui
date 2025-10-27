import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  MenuItem
} from '@mui/material'
import axios from 'axios'
import { BASE_URL } from '../../../lib/config'

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 800,
  maxHeight: '80vh',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  overflowY: 'auto'
}

// ✅ Add your actual categories here
const categories = ['Core', 'Misclleneaous', 'Aptitude']

export default function AddProblemModal ({
  open = true,
  onSuccess,
  onClose,
  testId,
  sectionId
}) {
  const [problems, setProblems] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const observer = useRef()

  const lastProblemRef = useCallback(
    node => {
      if (loading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          setPage(prevPage => prevPage + 1)
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading, hasMore]
  )

  // ✅ Fetch problems based on page, search, and category
  const fetchProblems = async (pageNum, reset = false) => {
    setLoading(true)
    try {
      const res = await axios.get(
        `${BASE_URL}/api/admin/questionbanks?search=${search}&category=${category}&page=${pageNum}&limit=10&sortBy=createdAt&sortOrder=desc`,
        { withCredentials: true }
      )
      const newProblems = res.data.data || []

      setProblems(prev => {
        const existingIds = new Set(prev.map(p => p._id))
        const filtered = newProblems.filter(p => !existingIds.has(p._id))
        return reset ? filtered : [...prev, ...filtered]
      })

      setHasMore(newProblems.length > 0)
    } catch (err) {
      console.error('Error fetching problems:', err)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }



  // ✅ Reset on search or category change
  useEffect(() => {
    if (open) {
      setProblems([])
      setPage(1)
      setHasMore(true)
      fetchProblems(1, true)
    }
  }, [search, category, open])

  const handleSelectProblem = async questionBankId => {
    try {
      await axios.put(
        `${BASE_URL}/api/admin/campus/tests/${testId}/sections/${sectionId}/question-bank`,
        { questionBankId },
        { withCredentials: true }
      )
      alert('Problem added successfully!')
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Failed to add problem:', err)
      alert('Failed to add problem')
    }
  }

  const handleClose = () => {
    setProblems([])
    setPage(1)
    setHasMore(true)
    setSearch('')
    setCategory('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant='h6' mb={2}>
          Select QuestionBank to Add
        </Typography>

        {/* 🔍 Search and Category Filters */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
          <TextField
          size='small'
            label='Search'
            value={search}
            onChange={e => setSearch(e.target.value)}
            fullWidth
          />
          <TextField
            select
            size='small'
            label='Category'
            value={category}
            onChange={e => setCategory(e.target.value)}
            fullWidth
          >
            <MenuItem value=''>All</MenuItem>
            {categories.map(cat => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {/* 🧩 List of Problem Sets */}
        <List>
          {problems.map((problem, index) => {
            const isLast = problems.length === index + 1
            return (
              <ListItem
                key={problem._id}
                ref={isLast ? lastProblemRef : null}
                divider
                secondaryAction={
                  <Button
                    size='small'
                    variant='contained'
                    onClick={() => handleSelectProblem(problem._id)}
                  >
                    Add
                  </Button>
                }
              >
                <Stack>
                  <ListItemText
                    primary={problem.name}
                    secondary={`Category: ${problem.category}`}
                  />
                  <ListItemText
                    primary={'No of Questions'}
                    secondary={`${problem.questionsCount}`}
                  />
                </Stack>
              </ListItem>
            )
          })}
        </List>

        {/* 🔄 Loader */}
        {loading && (
          <Box className='flex justify-center mt-4'>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* ❌ No Results */}
        {!loading && !hasMore && problems.length === 0 && (
          <Typography className='text-center mt-4' color='textSecondary'>
            No problems found.
          </Typography>
        )}
      </Box>
    </Modal>
  )
}
