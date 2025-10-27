import { Add, Close } from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogContent,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material'
import axios from 'axios'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { BASE_URL } from '../../../lib/config'
import { useSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom'

export default function Addquiz ({ setModalClose }) {
  const user = useSelector(state => state.auth.user)
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar()
  const [disable, setDisable] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    creator: user._id,
    duration: '',
    questions: [],
    marks: '',
    category: '',
    difficulty: ''
  })

  const changeHandler = e => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]:
        name === 'marks' || name === 'duration' ? parseInt(value) || 0 : value
    })
  }

  const submitHandler = async e => {
    e.preventDefault()
    setDisable(true)

    const { title, marks, duration, category, difficulty } = formData

    // Basic validation
    if (!title || !marks || !duration || !category || !difficulty) {
      enqueueSnackbar('Please fill in all required fields.', {
        variant: 'warning'
      })
      setDisable(false)
      return
    }

    if (marks <= 0 || duration <= 0) {
      enqueueSnackbar('Marks and duration must be greater than 0.', {
        variant: 'error'
      })
      setDisable(false)
      return
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/admin/quiz/add/`, formData, {
        withCredentials: true
      }) 
      const quizId = res.data.quiz._id;

      setModalClose(false)
      enqueueSnackbar('Quiz added successfully 🎉', { variant: 'success' })
      // window.location.reload()
      navigate('/admin/edit/quiz/'+quizId)
    } catch (error) {
      console.error(error)

      // Try to read server error if available
      const message =
        error.response?.data?.message || 'Failed to add quiz. Please try again.'

      enqueueSnackbar(message, { variant: 'error' })
      setDisable(false)
    }
  }
  return (
    <Dialog open onClose={() => setModalClose(false)} maxWidth='sm' fullWidth>
      <DialogContent
        dividers
        className='relative bg-white rounded-md p-5 shadow-md max-h-[90vh] overflow-y-auto'
      >
        <form onSubmit={submitHandler} className='px-2 sm:px-5 pb-10 pt-8'>
          <div className='mb-5 flex flex-col gap-3'>
            <TextField
              size='small'
              required
              autoComplete='off'
              name='title'
              value={formData.title}
              onChange={changeHandler}
              label='Quiz Title'
            />

            <TextField
              size='small'
              required
              autoComplete='off'
              type='number'
              name='marks'
              value={formData.marks}
              onChange={changeHandler}
              label='Quiz Marks'
            />

            <TextField
              size='small'
              required
              autoComplete='off'
              type='number'
              name='duration'
              value={formData.duration}
              onChange={changeHandler}
              label='Quiz Duration (minutes)'
            />

            <FormControl size='small' required>
              <InputLabel>Category</InputLabel>
              <Select
                name='category'
                value={formData.category}
                onChange={changeHandler}
                label='Category'
              >
                <MenuItem value='Aptitude'>Aptitude</MenuItem>
                <MenuItem value='Core'>Core</MenuItem>
                <MenuItem value='Miscellaneous'>Miscellaneous</MenuItem>
                <MenuItem value='Gate'>Gate</MenuItem>
                <MenuItem value='Map'>Map</MenuItem>
              </Select>
            </FormControl>

            <FormControl size='small' required>
              <InputLabel>Difficulty</InputLabel>
              <Select
                name='difficulty'
                value={formData.difficulty}
                onChange={changeHandler}
                label='Difficulty'
              >
                <MenuItem value='Easy'>Easy</MenuItem>
                <MenuItem value='Medium'>Medium</MenuItem>
                <MenuItem value='Hard'>Hard</MenuItem>
              </Select>
            </FormControl>
          </div>

          <div className='flex justify-end gap-2'>
            <Button
              type='submit'
              disabled={disable}
              variant='contained'
              color='primary'
              endIcon={<Add />}
              sx={{ color: '#f1f1f1', fontWeight: 'bold' }}
            >
              Add Quiz
            </Button>
            <Button variant='outlined' onClick={() => setModalClose(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
