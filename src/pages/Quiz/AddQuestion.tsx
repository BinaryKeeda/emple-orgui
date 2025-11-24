import { useState, type ChangeEvent, type FormEvent } from 'react'
import {
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  IconButton,
} from '@mui/material'
import axios from 'axios'
import { UploadFile, Close } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { BASE_URL } from '../../config/config'
import DeleteConfirmBox from '../../Layout/DeleteConfirmBox'

// -------------------- Types --------------------
interface Option {
  text: string
  isCorrect: boolean
}

interface FormState {
  quizId: string
  question: string
  image: File | string
  marks: string
  category: 'MCQ' | 'MSQ' | 'Text' | ''
  answer: string
  negative: string
  options: Option[]
}

interface AddQuestionProps {
  quizId: string
  maxMarks: number
  currentMarks: number
  setCurrentMarks: (value: number) => void
  onRefresh: () => void
}

// -------------------- Component --------------------
export default function AddQuestion({
  quizId,
  maxMarks,
  onRefresh
}: AddQuestionProps) {
  const { enqueueSnackbar } = useSnackbar()

  const initialFormState: FormState = {
    quizId,
    question: '',
    image: '',
    marks: '',
    category: '',
    answer: '',
    negative: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]
  }

  const [formData, setFormData] = useState<FormState>(initialFormState)
  const [preview, setPreview] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [confirmOpen, setConfirmOpen] = useState(false) // <-- Confirmation dialog

  // -------------------- Handlers --------------------
  const changeHandler = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, files } = e.target as HTMLInputElement
    if (type === 'file' && files && files.length > 0) {
      const file = files[0]
      setFormData(prev => ({ ...prev, [name]: file }))
      setPreview(URL.createObjectURL(file))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]:
          name === 'marks' || name === 'negative'
            ? value
            : value
      }))
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...formData.options]
    updatedOptions[index].text = value
    setFormData({ ...formData, options: updatedOptions })
  }

  const handleCorrectChange = (index: number, type: 'MCQ' | 'MSQ') => {
    const updatedOptions = [...formData.options]
    if (type === 'MCQ') {
      updatedOptions.forEach((opt, i) => (opt.isCorrect = i === index))
    } else {
      updatedOptions[index].isCorrect = !updatedOptions[index].isCorrect
    }
    setFormData({ ...formData, options: updatedOptions })
  }

  const handleImageRemove = () => {
    setFormData(prev => ({ ...prev, image: '' }))
    setPreview('')
  }

  // -------------------- Submit --------------------
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.question || !formData.category) {
      enqueueSnackbar('Please fill all required fields correctly!', {
        variant: 'warning'
      })
      return
    }

    if (parseFloat(formData.marks) > maxMarks) {
      enqueueSnackbar('Mark exceeding allowed limit!', { variant: 'warning' })
      return
    }

    setLoading(true)
    const form = new FormData()

    if (formData.image instanceof File) {
      form.append('image', formData.image)
    }

    form.append(
      'data',
      JSON.stringify({
        quizId: formData.quizId,
        question: formData.question,
        marks: parseFloat(formData.marks) || 0,
        category: formData.category,
        answer: formData.answer,
        options: formData.options,
        negative: parseFloat(formData.negative) || 0
      })
    )

    try {
      await axios.post(`${BASE_URL}/api/admin/quiz/add/question`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      })
      enqueueSnackbar('Question added successfully!', { variant: 'success' })
      onRefresh()
      setFormData(initialFormState)
      setPreview('')
    } catch (err) {
      console.error(err)
      enqueueSnackbar('Failed to add question. Try again!', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // -------------------- JSX --------------------
  return (
    <form
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      onSubmit={handleSubmit}
      className='space-y-4 bg-white p-5'
    >
      <TextField
        minRows={2}
        size='small'
        fullWidth
        name='question'
        label='Question'
        multiline
        value={formData.question}
        onChange={changeHandler}
        required
      />

      <TextField
        size='small'
        fullWidth
        name='marks'
        type='number'
        label='Marks'
        value={formData.marks}
        onChange={changeHandler}
        inputProps={{ min: 0, step: 'any' }}
        required
      />

      <TextField
        size='small'
        fullWidth
        name='negative'
        type='number'
        label='Negative Marks'
        value={formData.negative}
        onChange={changeHandler}
        inputProps={{ min: 0, step: 'any' }}
      />

      <TextField
        size='small'
        select
        fullWidth
        name='category'
        label='Category'
        value={formData.category}
        onChange={changeHandler}
        required
      >
        <MenuItem value='MCQ'>MCQ</MenuItem>
        <MenuItem value='MSQ'>MSQ</MenuItem>
        <MenuItem value='Text'>Text</MenuItem>
      </TextField>

      {formData.category === 'Text' && (
        <TextField
          size='small'
          fullWidth
          name='answer'
          label='Answer'
          value={formData.answer}
          onChange={changeHandler}
          required
        />
      )}

      {(formData.category === 'MCQ' || formData.category === 'MSQ') && (
        <div className='grid grid-cols-1 gap-2'>
          {formData.options.map((opt, index) => (
            <div key={index} className='flex items-center gap-2'>
              <TextField
                size='small'
                className='flex-1'
                label={`Option ${index + 1}`}
                value={opt.text}
                onChange={e => handleOptionChange(index, e.target.value)}
                required
              />

              {formData.category === 'MCQ' ? (
                <input
                  type='radio'
                  name='correctOption'
                  checked={opt.isCorrect}
                  onChange={() => handleCorrectChange(index, 'MCQ')}
                />
              ) : (
                <input
                  type='checkbox'
                  checked={opt.isCorrect}
                  onChange={() => handleCorrectChange(index, 'MSQ')}
                />
              )}
              Correct
            </div>
          ))}
        </div>
      )}

      {/* IMAGE UPLOAD */}
      <div className='flex items-center gap-2'>
        <Button component='label' variant='outlined' startIcon={<UploadFile />}>
          Upload Image
          <input type='file' name='image' hidden onChange={changeHandler} />
        </Button>

        {preview && (
          <div className='flex items-center gap-1'>
            <img
              src={preview}
              alt='Preview'
              className='h-20 object-contain cursor-pointer'
            />

            <IconButton size='small' onClick={() => setConfirmOpen(true)}>
              <Close />
            </IconButton>
          </div>
        )}
      </div>

      <Button type='submit' variant='contained' disabled={loading}>
        {loading ? <CircularProgress size={20} /> : 'Add Question'}
      </Button>
      <DeleteConfirmBox
        open={confirmOpen}
        title='Remove Image?'
        message='This will permanently remove the selected image.'
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          handleImageRemove()
          setConfirmOpen(false)
        }}
      />
    </form>
  )
}
