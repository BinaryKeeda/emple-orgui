import { useState, type ChangeEvent } from 'react'
import {
  Box,
  TextField,
  Typography,
  Button,
  Radio,
  Checkbox,
  MenuItem,
  Modal,
  CircularProgress
} from '@mui/material'
import { Upload } from '@mui/icons-material'
import * as XLSX from 'xlsx'
import axios from 'axios'
import { BASE_URL } from '../../config/config'
import { useSnackbar } from 'notistack'

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '95%',
  maxWidth: 900,
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  overflowY: 'auto'
}

type Category = 'MCQ' | 'MSQ' | 'Text'

interface Option {
  text: string
  isCorrect: boolean
}

interface Question {
  question: string
  marks: number
  negative: number
  topic: string
  category: Category
  answer?: string
  options?: Option[]
}

interface ManualQuestionFormProps {
  onSubmit: (questions: Question[]) => Promise<void>
}

function ManualQuestionForm({ onSubmit }: ManualQuestionFormProps) {
  const [questionData, setQuestionData] = useState<Question>({
    question: '',
    marks: 1,
    negative: 0,
    topic: '',
    category: 'MCQ',
    answer: '',
    options: Array(4).fill({ text: '', isCorrect: false })
  })

  const [submitting, setSubmitting] = useState(false)

  const handleOptionTextChange = (index: number, value: string) => {
    if (!questionData.options) return
    const updated = [...questionData.options]
    updated[index] = { ...updated[index], text: value }
    setQuestionData({ ...questionData, options: updated })
  }

  const handleMCQCorrectChange = (index: number) => {
    if (!questionData.options) return
    const updated = questionData.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index
    }))
    setQuestionData({ ...questionData, options: updated })
  }

  const handleMSQCorrectToggle = (index: number) => {
    if (!questionData.options) return
    const updated = [...questionData.options]
    updated[index].isCorrect = !updated[index].isCorrect
    setQuestionData({ ...questionData, options: updated })
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      await onSubmit([questionData])
      setQuestionData({
        question: '',
        marks: 1,
        negative: 0,
        topic: '',
        category: 'MCQ',
        answer: '',
        options: Array(4).fill({ text: '', isCorrect: false })
      })
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <TextField
        size='small'
        label='Question Text'
        fullWidth
        multiline
        value={questionData.question}
        onChange={e =>
          setQuestionData({ ...questionData, question: e.target.value })
        }
      />
      <TextField
        size='small'
        label='Topic'
        fullWidth
        value={questionData.topic}
        onChange={e =>
          setQuestionData({ ...questionData, topic: e.target.value })
        }
      />
      <TextField
        size='small'
        label='Marks'
        type='number'
        value={questionData.marks}
        onChange={e =>
          setQuestionData({
            ...questionData,
            marks: parseFloat(e.target.value)
          })
        }
      />
      <TextField
        size='small'
        label='Negative Marks'
        type='number'
        value={questionData.negative}
        onChange={e =>
          setQuestionData({
            ...questionData,
            negative: parseFloat(e.target.value)
          })
        }
      />
      <TextField
        size='small'
        select
        label='Category'
        fullWidth
        value={questionData.category}
        onChange={e => {
          const cat = e.target.value as Category
          const baseOptions = Array(4).fill({ text: '', isCorrect: false })
          setQuestionData({
            ...questionData,
            category: cat,
            options: baseOptions,
            answer: ''
          })
        }}
      >
        <MenuItem value='MCQ'>MCQ</MenuItem>
        <MenuItem value='MSQ'>MSQ</MenuItem>
        <MenuItem value='Text'>Text</MenuItem>
      </TextField>

      {questionData.category === 'Text' && (
        <TextField
          size='small'
          label='Answer'
          fullWidth
          value={questionData.answer}
          onChange={e =>
            setQuestionData({ ...questionData, answer: e.target.value })
          }
        />
      )}

      {(questionData.category === 'MCQ' || questionData.category === 'MSQ') && questionData.options && (
        <Box>
          <Typography sx={{ my: 1 }} className='mb-5 font-medium'>
            Options (4 required):
          </Typography>
          {questionData.options.map((opt, idx) => (
            <Box key={idx} className='flex items-center gap-2 mb-2'>
              {questionData.category === 'MCQ' ? (
                <Radio
                  size='small'
                  checked={opt.isCorrect}
                  onChange={() => handleMCQCorrectChange(idx)}
                />
              ) : (
                <Checkbox
                  size='small'
                  checked={opt.isCorrect}
                  onChange={() => handleMSQCorrectToggle(idx)}
                />
              )}
              <TextField
                size='small'
                fullWidth
                label={`Option ${idx + 1}`}
                value={opt.text}
                onChange={e => handleOptionTextChange(idx, e.target.value)}
              />
            </Box>
          ))}
        </Box>
      )}

      <Button variant='contained' onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Submitting...' : 'Add Question'}
      </Button>
    </Box>
  )
}

interface AddTestSectionQuestionsModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  testId: string
  sectionId: string
}

export default function AddTestSectionQuestionsModal({
  open,
  onClose,
  onSuccess,
  testId,
  sectionId
}: AddTestSectionQuestionsModalProps) {
  const [loading, setLoading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const { enqueueSnackbar } = useSnackbar();
  const handleJSONUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setLoading(true)
      const text = await file.text()
      const questions: Question[] = JSON.parse(text)
      await submitQuestions(questions)
    } catch (err) {
      console.error(err)
      setUploadError('Invalid JSON format')
    } finally {
      setLoading(false)
    }
  }

  const handleExcelUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setLoading(true)
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows: any[] = XLSX.utils.sheet_to_json(sheet)

      const transformed: Question[] = rows.map(row => {
        const {
          question,
          category,
          marks,
          negative,
          topic,
          answer,
          option1,
          correct1,
          option2,
          correct2,
          option3,
          correct3,
          option4,
          correct4
        } = row

        const base: Question = {
          question: question || '',
          category: category || 'MCQ',
          marks: parseFloat(marks) || 1,
          negative: parseFloat(negative) || 0,
          topic: topic || ''
        }

        if (base.category === 'Text') {
          return { ...base, answer: answer || '' }
        }

        const options: Option[] = [
          { text: option1 || '', isCorrect: correct1 === true || correct1 === 'true' },
          { text: option2 || '', isCorrect: correct2 === true || correct2 === 'true' },
          { text: option3 || '', isCorrect: correct3 === true || correct3 === 'true' },
          { text: option4 || '', isCorrect: correct4 === true || correct4 === 'true' }
        ]

        return { ...base, options }
      })

      await submitQuestions(transformed)
    } catch (err) {
      console.error(err)
      setUploadError('Invalid Excel format')
    } finally {
      setLoading(false)
    }
  }

  const submitQuestions = async (questions: Question[]) => {
    try {
      await axios.post(
        `${BASE_URL}/api/admin/tests/${testId}/sections/${sectionId}/questions`,
        questions,
        { withCredentials: true }
      )
      enqueueSnackbar('Questions added successfully!', {
        variant:"success"
      })
      onClose()
      onSuccess()
    } catch (err) {
      console.error(err)
      enqueueSnackbar('Failed to submit questions' , {
        variant: "error"
      })
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>

        {/* Upload Buttons */}
        <div className='flex gap-4 mb-4'>
          <Button
            variant='outlined'
            component='label'
            startIcon={<Upload fontSize='small' />}
          >
            Upload JSON
            <input type='file' accept='.json' hidden onChange={handleJSONUpload} />
          </Button>
          <Button
            variant='outlined'
            component='label'
            startIcon={<Upload fontSize='small' />}
          >
            Upload Excel
            <input type='file' accept='.xlsx,.xls' hidden onChange={handleExcelUpload} />
          </Button>
        </div>

        {uploadError && (
          <Typography color='error' variant='body2' className='mb-2'>
            {uploadError}
          </Typography>
        )}

        <div className='flex gap-4 mb-6'>
          <Button variant='outlined' href='/data/sample-json.json' download startIcon={<Upload fontSize='small' />}>
            Download JSON Template
          </Button>

          <Button variant='outlined' href='/data/sample-excel.xlsx' download startIcon={<Upload fontSize='small' />}>
            Download Excel Template
          </Button>
        </div>

        {/* Manual Question Form */}
        <Typography variant='subtitle1' className='mb-2 font-semibold'>
          Manual Entry
        </Typography>
        <ManualQuestionForm onSubmit={submitQuestions} />

        {loading && <CircularProgress className='mt-4' />}
      </Box>
    </Modal>
  )
}
