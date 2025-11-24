import {
  ArrowDropDown,
  Cloud,
  Delete,
  UploadFile
} from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  TextField
} from '@mui/material'
import axios from 'axios'
import React, { lazy, Suspense, useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { calcMarks } from './utils/lib/calcMarks'
import { useSelector } from 'react-redux'
import AddQuestion from './Quiz/AddQuestion'
import { useSnackbar } from 'notistack'
import { BASE_URL } from '../config/config'
import type { RootState } from '../store/store'
import DeleteConfirmBox from '../Layout/DeleteConfirmBox'

// 🔥 ADDED

// Lazy imports
const AddQuestionAiken = lazy(() => import('./Quiz/AddQuestionAiken'))
const AddQuestonJSON = lazy(() => import('./Quiz/AddQuestionJson'))
const AddQuestionExcel = lazy(() => import('./Quiz/AddQuestionExcel'))

// Types...
interface Option {
  text: string
  isCorrect: boolean
}

interface Question {
  _id: string
  question: string
  category: 'MCQ' | 'MSQ' | 'Text' | string
  image?: string
  marks: number
  answer?: string
  options?: Option[]
}

interface Quiz {
  _id: string
  title: string
  creator: string
  duration: number
  marks: number
  category: string
  difficulty: string
  isAvailable: boolean
  questions: Question[]
}

interface QuizEditProps {
  data: Quiz
  onRefresh: () => void
}

// Component
const EditQuiz: React.FC = () => {
  const [ModalClose, setModalClose] = useState(true)
  const [showJsonModal, setShowJsonModal] = useState(false)
  const [showAiken, setShowAiken] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const { slug: id } = useParams<{ slug: string }>()
  const [currentMarks, setCurrentMarks] = useState<number>(0)
  const [maxMarks, setMaxMarks] = useState<number>(0)
  const [refresh, setRefresh] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  // 🔥 DELETE CONFIRM DIALOG STATE
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null)

  // Fetch quiz data
  useEffect(() => {
    const getQuiz = async () => {
      try {
        const res = await axios.get<Quiz>(`${BASE_URL}/api/admin/quiz/${id}`, {
          withCredentials: true
        })
        if (res.data) setCurrentQuiz(res.data)
      } catch (error) {
        console.error(error)
        enqueueSnackbar('Failed to load quiz', { variant: 'error' })
      }
    }
    if (id) getQuiz()
  }, [id, refresh, enqueueSnackbar])

  // Update marks
  useEffect(() => {
    if (currentQuiz) {
      setMaxMarks(currentQuiz.marks)
      setCurrentMarks(calcMarks(currentQuiz.questions || []))
    }
  }, [currentQuiz])

  // DELETE request function
  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await axios.delete(
        `${BASE_URL}/api/admin/quiz/question/del/${currentQuiz?._id}/${questionId}`,
        { withCredentials: true }
      )
      enqueueSnackbar('Question deleted successfully!', { variant: 'success' })
      setRefresh(prev => !prev)
    } catch (error) {
      console.error(error)
      enqueueSnackbar('Failed to delete question', { variant: 'error' })
    }
  }

  if (!currentQuiz) {
    return (
      <div className='h-screen w-screen fixed flex justify-center items-center z-[2999]'>
        <CircularProgress size={'27px'} />
      </div>
    )
  }

  return (
    <section className='flex flex-col gap-6'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:justify-between md:items-center bg-white rounded-md shadow-sm p-6 gap-4'>
        <div className='flex flex-col text-sm'>
          <span className='text-gray-600'>
            <strong>Status:</strong>{' '}
            {currentQuiz.isAvailable ? 'Available' : 'Not Available'}
          </span>
          <span className='text-gray-600'>
            <strong>Current Marks:</strong> {currentMarks} / {maxMarks}
          </span>
        </div>
        <div className='flex flex-wrap gap-3'>
          <Button
            onClick={() => setModalClose(false)}
            variant='outlined'
            startIcon={<Cloud />}
          >
            Upload Excel
          </Button>
          <Button
            onClick={() => setShowJsonModal(true)}
            variant='contained'
            startIcon={<UploadFile />}
          >
            Upload JSON
          </Button>
          <Button
            onClick={() => setShowAiken(true)}
            variant='contained'
            startIcon={<UploadFile />}
          >
            Upload AIKEN
          </Button>
        </div>
      </div>

      {/* Edit Form */}
      <QuizEdit data={currentQuiz} onRefresh={() => setRefresh(prev => !prev)} />

      {/* Add Question */}
      <AddQuestion
        quizId={id!}
        maxMarks={maxMarks}
        currentMarks={currentMarks}
        setCurrentMarks={setCurrentMarks}
        onRefresh={() => setRefresh(prev => !prev)}
      />

      {/* Questions */}
      <section className='bg-white p-6 rounded-md shadow-sm'>
        <h2 className='text-lg font-semibold mb-4'>Questions</h2>

        {currentQuiz.questions.length > 0 ? (
          currentQuiz.questions.map((item, index) => (
            <Accordion key={item._id} className='mb-3 rounded-md border'>
              <AccordionSummary expandIcon={<ArrowDropDown />}>
                <div className='flex w-full justify-between items-center'>
                  <h3 className='text-sm font-medium'>
                    Question {index + 1}:{' '}
                    <span className='ml-2 font-normal'>{item.question}</span>
                  </h3>

                  <div className='flex items-center gap-3'>
                    {/* 🔥 Replace direct delete with confirmation */}
                    <IconButton
                      onClick={() => {
                        setQuestionToDelete(item._id)
                        setDeleteDialogOpen(true)
                      }}
                      size='small'
                    >
                      <Delete sx={{ color: 'gray' }} />
                    </IconButton>

                    <span className='text-xs text-gray-600'>
                      {item.marks} Marks
                    </span>
                  </div>
                </div>
              </AccordionSummary>

              <AccordionDetails>
                <div className='px-4 text-sm flex flex-col gap-2'>
                  <p>
                    <strong>Type:</strong> {item.category}
                  </p>

                  {item.image && (
                    <img
                      src={item.image}
                      alt='Question'
                      className='my-2 h-24 w-auto object-contain rounded-md border'
                    />
                  )}

                  {item.category === 'Text' && (
                    <TextField
                      label='Answer'
                      value={item.answer}
                      variant='standard'
                      disabled
                      fullWidth
                    />
                  )}

                  {(item.category === 'MCQ' || item.category === 'MSQ') &&
                    item.options?.map((opt, k) => (
                      <div key={k} className='flex items-center gap-2'>
                        <span>
                          Option {k + 1}: {opt.text}
                        </span>
                        <input type='radio' checked={opt.isCorrect} readOnly />
                        <span className='text-xs text-green-600'>
                          {opt.isCorrect ? 'Correct' : ''}
                        </span>
                      </div>
                    ))}
                </div>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <p className='text-sm text-gray-500 italic'>No Questions to display</p>
        )}
      </section>

      {/* Upload Modals */}
      {!ModalClose && (
        <Suspense fallback={<div className='loader'></div>}>
          <AddQuestionExcel
            id={id!}
            setModalClose={setModalClose}
            onSuccess={() => {
              enqueueSnackbar('Excel uploaded successfully!', {
                variant: 'success'
              })
              setRefresh(prev => !prev)
            }}
            onError={() =>
              enqueueSnackbar('Upload failed', { variant: 'error' })
            }
          />
        </Suspense>
      )}

      {showJsonModal && (
        <AddQuestonJSON
          id={id!}
          setModalClose={() => setShowJsonModal(false)}
          onSuccess={() => {
            enqueueSnackbar('JSON uploaded successfully!', {
              variant: 'success'
            })
            setRefresh(prev => !prev)
          }}
          onError={() =>
            enqueueSnackbar('JSON upload failed', { variant: 'error' })
          }
        />
      )}

      {showAiken && (
        <AddQuestionAiken
          id={id!}
          setModalClose={() => setShowAiken(false)}
          onSuccess={() => {
            enqueueSnackbar('AIKEN uploaded successfully!', {
              variant: 'success'
            })
            setRefresh(prev => !prev)
          }}
          onError={() =>
            enqueueSnackbar('AIKEN upload failed', { variant: 'error' })
          }
        />
      )}

      {/* 🔥 DELETE CONFIRM DIALOG */}
      <DeleteConfirmBox
        open={deleteDialogOpen}
        title="Delete Question?"
        message="This question will be permanently removed from the quiz."
        onCancel={() => {
          setDeleteDialogOpen(false)
          setQuestionToDelete(null)
        }}
        onConfirm={() => {
          if (questionToDelete) handleDeleteQuestion(questionToDelete)
          setDeleteDialogOpen(false)
          setQuestionToDelete(null)
        }}
      />
    </section>
  )
}

// === Edit Quiz form (unchanged) ===
export const QuizEdit: React.FC<QuizEditProps> = ({ data, onRefresh }) => {
  const userId = useSelector((s: RootState) => s.auth.user?.user._id)
  const { enqueueSnackbar } = useSnackbar()

  const [formData, setFormData] = useState({
    title: data.title,
    creator: userId,
    duration: data.duration,
    marks: data.marks,
    category: data.category,
    difficulty: data.difficulty,
    isAvailable: data.isAvailable
  })

  const changeHandler = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : ['marks', 'duration'].includes(name)
            ? parseInt(value)
            : value
    }))
  }

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await axios.post(
        `${BASE_URL}/api/admin/quiz/edit/${data._id}`,
        formData,
        { withCredentials: true }
      )
      enqueueSnackbar('Quiz updated successfully!', { variant: 'success' })
      onRefresh()
    } catch (error) {
      enqueueSnackbar('Failed to update quiz', { variant: 'error' })
      console.error(error)
    }
  }

  return (
    <section className='p-6 bg-white rounded-md shadow-sm'>
      <h2 className='text-lg font-semibold mb-4'>Edit Quiz Details</h2>
      <form
        onSubmit={submitHandler}
        className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      >
        <div>
          <label className='block text-sm font-semibold mb-1'>Creator</label>
          <TextField size='small' type='text' fullWidth value={userId} />
        </div>

        <div>
          <label className='block text-sm font-semibold mb-1'>Title</label>
          <TextField
            size='small'
            type='text'
            name='title'
            fullWidth
            value={formData.title}
            onChange={changeHandler}
          />
        </div>

        <div>
          <label className='block text-sm font-semibold mb-1'>Marks</label>
          <TextField
            size='small'
            type='number'
            name='marks'
            value={formData.marks}
            onChange={changeHandler}
            fullWidth
          />
        </div>

        <div>
          <label className='block text-sm font-semibold mb-1'>
            Duration (min)
          </label>
          <TextField
            size='small'
            type='number'
            name='duration'
            value={formData.duration}
            onChange={changeHandler}
            fullWidth
          />
        </div>

        <div>
          <label className='block text-sm font-semibold mb-1'>Category</label>
          <FormControl fullWidth>
            <Select
              size='small'
              name='category'
              value={formData.category}
              onChange={changeHandler}
            >
              <MenuItem value='Aptitude'>Aptitude</MenuItem>
              <MenuItem value='Core'>Core</MenuItem>
              <MenuItem value='Miscellaneous'>Miscellaneous</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div>
          <label className='block text-sm font-semibold mb-1'>Difficulty</label>
          <FormControl fullWidth>
            <Select
              size='small'
              name='difficulty'
              value={formData.difficulty}
              onChange={changeHandler}
            >
              <MenuItem value='Easy'>Easy</MenuItem>
              <MenuItem value='Medium'>Medium</MenuItem>
              <MenuItem value='Hard'>Hard</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div className='flex items-center gap-2 mt-2'>
          <label className='text-sm font-semibold'>Available</label>
          <Checkbox
            checked={formData.isAvailable}
            onChange={changeHandler}
            name='isAvailable'
          />
        </div>

        <div className='col-span-full'>
          <Button type='submit' variant='contained'>
            Update Quiz
          </Button>
        </div>
      </form>
    </section>
  )
}

export default EditQuiz
