import React, { useState } from 'react'
import {
  Modal,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack
} from '@mui/material'
import axios from 'axios'
import { BASE_URL } from '../../../lib/config'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 500,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4
}

const categories = ['Core', 'Miscellaneous', 'Aptitude']
const types = ['MCQ', 'Coding']

export default function CreateQuestionBankModal ({ open, onClose, onSuccess }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
 const handleSubmit = async () => {
  if (!name || !category) {
    enqueueSnackbar('All fields are required ⚠️', { variant: 'warning' })
    return
  }

  try {
    setLoading(true)
    const res = await axios.post(
      `${BASE_URL}/api/admin/add/questionbank`, // fixed double slash
      { name, category },
      { withCredentials: true }
    )
    const bankId = res.data.bank._id
    navigate('/admin/edit/questionbanks/' + bankId)
    enqueueSnackbar('Question bank created successfully 🎉', { variant: 'success' })
    onClose()
  } catch (err) {
    console.error('Error creating question bank:', err)
    enqueueSnackbar('Failed to create question bank ❌', { variant: 'error' })
  } finally {
    setLoading(false)
  }
}

  const handleClose = () => {
    setName('')
    setType('')
    setCategory('')
    onClose()
  }

  return (
    <Modal open={true} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant='h6' mb={3}>
          Create Question Bank
        </Typography>

        <Stack spacing={2}>
          <TextField
            label='Name'
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            size='small'
          />
          <TextField
            select
            label='Category'
            value={category}
            onChange={e => setCategory(e.target.value)}
            fullWidth
            size='small'
          >
            {categories.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <Button variant='contained' onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
          <Button
            onClick={() => {
              onClose()
            }}
          >
            Cancel
          </Button>
        </Stack>
      </Box>
    </Modal>
  )
}
