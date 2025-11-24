import React, { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Modal,
  Fade,
  Backdrop,
  IconButton,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import axios from 'axios'
import { BASE_URL } from '../../config/config'
import { useQueryClient } from '@tanstack/react-query'

type AddExamModalProps = {
  sectionId: string
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface ExamPayload {
  name: string
  sectionId: string
  visibility: 'public' | 'private' | 'restricted'
}

const AddExamModal: React.FC<AddExamModalProps> = ({
  sectionId,
  open,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<ExamPayload>({
    name: '',
    sectionId,
    visibility: 'public',
  })
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await axios.post(`${BASE_URL}/api/exam/create`, formData)
      if (res.data.success) {
        onSuccess?.()
        setFormData({
          name: '',
          sectionId,
          visibility: 'public',
        })
        queryClient.invalidateQueries({ queryKey: ['exam'] })
        onClose()
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating exam')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 300 } }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            width: '90%',
            maxWidth: 450,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              Create New Exam
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <TextField
              label="Exam Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
            />



            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              sx={{ mt: 1 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Exam'}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddExamModal
