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
  TextField,
  Checkbox
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

export default function AddProblemModal({ open, onSuccess, onClose, testId, sectionId }) {
  const [problems, setProblems] = useState([])
  const [selectedProblems, setSelectedProblems] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [search, setSearch] = useState('')

  const observer = useRef()

  const lastProblemRef = useCallback(
    (node) => {
      if (loading) return
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1)
        }
      })

      if (node) observer.current.observe(node)
    },
    [loading, hasMore]
  )

  const fetchProblems = async (pageNum, reset = false) => {
    setLoading(true)
    try {
      const res = await axios.get(
        `${BASE_URL}/api/admin/problems?search=${search}&page=${pageNum}&limit=10&sortBy=createdAt&sortOrder=desc`,
        { withCredentials: true }
      )
      const newProblems = res.data.data || []

      setProblems(prev =>
        reset ? newProblems : [...prev, ...newProblems.filter(p => !prev.some(item => item._id === p._id))]
      )
      setHasMore(newProblems.length > 0)
    } catch (err) {
      console.error('Error fetching problems:', err)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchProblems(page)
    }
  }, [page, open])

  useEffect(() => {
    if (open) {
      setProblems([])
      setPage(1)
      setHasMore(true)
      fetchProblems(1, true)
    }
  }, [search, open])

  const toggleProblemSelection = (problemId) => {
    setSelectedProblems((prevSelected) =>
      prevSelected.includes(problemId)
        ? prevSelected.filter(id => id !== problemId)
        : [...prevSelected, problemId]
    )
  }

  const handleAddSelectedProblems = async () => {
    if (selectedProblems.length === 0) {
      alert('Please select at least one problem.')
      return
    }

    try {
      await axios.put(
        `${BASE_URL}/api/admin/campus/tests/${testId}/sections/${sectionId}/problems`,
        { problemIds: selectedProblems },
        { withCredentials: true }
      )
      alert('Problems added successfully!')
      onSuccess()
      handleClose()
    } catch (err) {
      console.error('Failed to add problems:', err)
      alert('Failed to add problems')
    }
  }

  const handleClose = () => {
    setProblems([])
    setSelectedProblems([])
    setPage(1)
    setHasMore(true)
    setSearch('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant='h6' mb={2}>
          Select Problems to Add
        </Typography>

        <TextField
          size='small'
          label='Search problems'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        <List>
          {problems.map((problem, index) => {
            const isLast = problems.length === index + 1
            return (
              <ListItem
                key={problem._id}
                ref={isLast ? lastProblemRef : null}
                divider
                secondaryAction={
                  <Checkbox
                    edge='end'
                    checked={selectedProblems.includes(problem._id)}
                    onChange={() => toggleProblemSelection(problem._id)}
                  />
                }
              >
                <ListItemText
                  primary={problem.title}
                  secondary={`Difficulty: ${problem.difficulty}`}
                />
              </ListItem>
            )
          })}
        </List>

        {loading && (
          <Box className='flex justify-center mt-4'>
            <CircularProgress size={24} />
          </Box>
        )}

        {!loading && !hasMore && problems.length === 0 && (
          <Typography className='text-center mt-4' color='textSecondary'>
            No problems found.
          </Typography>
        )}

        <Box mt={2} className='flex justify-end'>
          <Button
            variant='contained'
            onClick={handleAddSelectedProblems}
            disabled={selectedProblems.length === 0}
          >
            Add Selected ({selectedProblems.length})
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}
