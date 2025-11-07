import  { useEffect, useState, lazy, Suspense, type JSX } from 'react'
import {
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton
} from '@mui/material'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import AddIcon from '@mui/icons-material/Add'
import { BASE_URL } from '../config/config'
import { Delete } from '@mui/icons-material'

const AddProblemModal = lazy(() => import('./modals/AddTestProblemModal'))
const AddQuestionModal = lazy(() => import('./modals/AddTestSectionQuestionsModal'))

// === Types ===
interface Question {
  _id?: string
  question?: string
  category?: string
  difficulty?: string
  marks?: number
}

interface Problem {
  _id?: string
  title?: string
  difficulty?: string
  tags?: string[]
}

interface Section {
  _id: string
  name: string
  sectionType: 'Quiz' | 'Coding'
  questionSet?: Question[]
  problemset?: Problem[]
}

interface TestData {
  _id: string
  name: string
  description?: string
  duration?: number
  category: string
  visibility: 'private' | 'public' | 'group'
  isAvailable: boolean
  sections: Section[]
}

interface NewSection {
  name: string
  sectionType: 'Quiz' | 'Coding'
}

export default function EditTestPage(): JSX.Element {
  const { slug: testId } = useParams<{ slug: string }>()
  const [test, setTest] = useState<TestData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [newSection, setNewSection] = useState<NewSection>({ name: '', sectionType: 'Quiz' })
  const [addingSection, setAddingSection] = useState<boolean>(false)
  const [savingChanges, setSavingChanges] = useState<boolean>(false)

  // Modals
  const [openProblemModal, setOpenProblemModal] = useState<string | null>(null)
  const [openQuestionModal, setOpenQuestionModal] = useState<string | null>(null)

  const handleOpenProblemModal = (sectionId: string) => setOpenProblemModal(sectionId)
  const handleCloseProblemModal = () => setOpenProblemModal(null)

  const handleOpenQuestionModal = (sectionId: string) => setOpenQuestionModal(sectionId)
  const handleCloseQuestionModal = () => setOpenQuestionModal(null)

  // === Fetch Test ===
  const fetchTest = async () => {
    try {
      setLoading(true)
      const res = await axios.get<{ data: TestData }>(`${BASE_URL}/api/admin/tests/${testId}`, {
        withCredentials: true
      })
      setTest(res.data.data)
    } catch (err) {
      console.error(err)
      setError('Failed to fetch test')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (testId) fetchTest()
  }, [testId])

  // === Add Section ===
  const handleAddSection = async () => {
    try {
      setAddingSection(true)
      const res = await axios.post<{ data: TestData }>(
        `${BASE_URL}/api/admin/tests/${testId}/sections`,
        newSection,
        { withCredentials: true }
      )
      setTest(res.data.data)
      setNewSection({ name: '', sectionType: 'Quiz' })
    } catch (err) {
      console.error('Failed to add section', err)
      alert('Failed to add section')
    } finally {
      setAddingSection(false)
    }
  }

  // === Save Test ===
  const handleSaveChanges = async () => {
    if (!test) return
    try {
      setSavingChanges(true)
      const res = await axios.put<{ data: TestData }>(
        `${BASE_URL}/api/admin/tests/update/${testId}`,
        test,
        { withCredentials: true }
      )
      setTest(res.data.data)
    } catch (err) {
      console.error('Failed to update test', err)
      alert('Failed to save changes')
    } finally {
      setSavingChanges(false)
    }
  }

  // === UI States ===
  if (loading)
    return (
      <div className='flex justify-center py-12'>
        <CircularProgress />
      </div>
    )

  if (error) return <Typography color='error'>{error}</Typography>
  if (!test) return <Typography>No test found.</Typography>

  return (
    <div className='p-6 md:p-10 bg-gray-50 min-h-screen'>
      <h4 className='font-bold mb-6 text-gray-800 text-xl'>
        Edit Test - {test.name}
      </h4>

      {/* Editable Fields */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
        <TextField
          size='small'
          label='Test Name'
          value={test.name}
          onChange={e => setTest({ ...test, name: e.target.value })}
          fullWidth
        />
        <TextField
          size='small'
          label='Duration (minutes)'
          type='number'
          value={test.duration ?? ''}
          onChange={e =>
            setTest({ ...test, duration: parseInt(e.target.value, 10) || 0 })
          }
          fullWidth
        />
        <TextField
          label='Description'
          size='small'
          value={test.description ?? ''}
          onChange={e => setTest({ ...test, description: e.target.value })}
          fullWidth
          multiline
          rows={3}
        />
        <TextField
          select
          size='small'
          label='Category'
          value={test.category}
          onChange={e => setTest({ ...test, category: e.target.value })}
          fullWidth
        >
          <MenuItem value='Placements'>Placements</MenuItem>
          <MenuItem value='Gate'>Gate</MenuItem>
        </TextField>
        <TextField
          select
          size='small'
          label='Visibility'
          value={test.visibility}
          onChange={e =>
            setTest({
              ...test,
              visibility: e.target.value as 'private' | 'public' | 'group'
            })
          }
          fullWidth
        >
          <MenuItem value='private'>Private</MenuItem>
          <MenuItem value='public'>Public</MenuItem>
          <MenuItem value='group'>Group</MenuItem>
        </TextField>
        <TextField
          select
          size='small'
          label='Availability'
          value={test.isAvailable ? 'true' : 'false'}
          onChange={e =>
            setTest({ ...test, isAvailable: e.target.value === 'true' })
          }
          fullWidth
        >
          <MenuItem value='true'>Available</MenuItem>
          <MenuItem value='false'>Not Available</MenuItem>
        </TextField>
      </div>

      <Button
        variant='contained'
        color='primary'
        onClick={handleSaveChanges}
        disabled={savingChanges}
        className='mb-8'
      >
        {savingChanges ? 'Saving...' : 'Save Changes'}
      </Button>

      {/* Add Section */}
      <div className='mt-8'>
        <h1 className='font-medium mb-2 pl-1 text-gray-700'>Add New Section</h1>
        <div className='flex flex-wrap items-center gap-4'>
          <TextField
            size='small'
            label='Section Name'
            value={newSection.name}
            onChange={e =>
              setNewSection({ ...newSection, name: e.target.value })
            }
          />
          <TextField
            size='small'
            select
            label='Type'
            value={newSection.sectionType}
            onChange={e =>
              setNewSection({
                ...newSection,
                sectionType: e.target.value as 'Quiz' | 'Coding'
              })
            }
          >
            <MenuItem value='Quiz'>Quiz</MenuItem>
            <MenuItem value='Coding'>Coding</MenuItem>
          </TextField>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={handleAddSection}
            disabled={addingSection || !newSection.name}
          >
            {addingSection ? 'Adding...' : 'Add Section'}
          </Button>
        </div>
      </div>

      {/* Section List */}
      <h2 className='font-semibold pl-1 mt-6 mb-4 text-gray-700 text-lg'>
        Sections
      </h2>

      {test.sections.length === 0 && (
        <p className='text-gray-500 italic mb-4'>No sections added yet.</p>
      )}

      {test.sections.map((section) => (
        <Paper
          key={section._id}
          elevation={0}
          className='p-4 relative border-gray-100 mb-4 shadow-sm border rounded-lg bg-white'
        >
          <IconButton sx={{position:"absolute" , right:8, top:8}}>
            <Delete sx={{fontSize:18}}/>
          </IconButton>
          <Typography className='font-semibold text-lg'>
            {section.name}
          </Typography>
          <Typography variant='body2' color='textSecondary'>
            Type:{' '}
            {section.sectionType === 'Quiz'
              ? `Quiz Questions ${section.questionSet?.length || 0}`
              : `Coding Problems ${section.problemset?.length || 0}`}
          </Typography>

          <div className='flex flex-col gap-4 mt-4'>
            {section.sectionType === 'Quiz' && (
              <Button
                size='small'
                variant='outlined'
                onClick={() => handleOpenQuestionModal(section._id)}
              >
                Add Questions
              </Button>
            )}

            {section.sectionType === 'Coding' && (
              <Button
                size='small'
                variant='outlined'
                onClick={() => handleOpenProblemModal(section._id)}
              >
                Add Problems
              </Button>
            )}
            <Accordion>
              <AccordionSummary>
                {section.sectionType === 'Quiz'
                  ? 'View Questions'
                  : 'View Problems'}
              </AccordionSummary>
              <AccordionDetails>
                {section.sectionType === 'Quiz' ? (
                  section.questionSet?.length ? (
                    <ul className='list-disc ml-6 space-y-2 text-sm text-gray-800'>
                      {section.questionSet.map((q, i) => (
                        <li key={q._id || i}>
                          <strong>{q.question || `Question ${i + 1}`}</strong>
                          <br />
                          <span className='text-gray-600'>Type:</span>{' '}
                          {q.category}
                          <br />
                          {q.difficulty && (
                            <>
                              <span className='text-gray-600'>Difficulty:</span>{' '}
                              {q.difficulty}
                              <br />
                            </>
                          )}
                          {q.marks && (
                            <>
                              <span className='text-gray-600'>Marks:</span>{' '}
                              {q.marks}
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className='text-gray-500 italic'>
                      No questions added yet.
                    </p>
                  )
                ) : section.problemset?.length ? (
                  <ul className='list-disc ml-6 space-y-2 text-sm text-gray-800'>
                    {section.problemset.map((p, i) => (
                      <li key={p._id || i}>
                        <strong>{p.title || `Problem ${i + 1}`}</strong>
                        <br />
                        {p.difficulty && (
                          <>
                            <span className='text-gray-600'>Difficulty:</span>{' '}
                            {p.difficulty}
                            <br />
                          </>
                        )}
                        {Array.isArray(p.tags) && p.tags.length > 0 && (
                          <>
                            <span className='text-gray-600'>Tags:</span>{' '}
                            {p.tags.join(', ')}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-gray-500 italic'>No problems added yet.</p>
                )}
              </AccordionDetails>
            </Accordion>
          </div>

          {/* Lazy-loaded modals */}
          <Suspense fallback={<div>Loading modal...</div>}>
            {openQuestionModal === section._id &&
              section.sectionType === 'Quiz' && (
                <AddQuestionModal
                  open={true}
                  onClose={handleCloseQuestionModal}
                  testId={testId!}
                  sectionId={section._id}
                  onSuccess={() => {
                    fetchTest()
                    handleCloseQuestionModal()
                  }}
                />
              )}

            {openProblemModal === section._id &&
              section.sectionType === 'Coding' && (
                <AddProblemModal
                  open={true}
                  onClose={handleCloseProblemModal}
                  testId={testId!}
                  sectionId={section._id}
                  onSuccess={() => {
                    fetchTest()
                    handleCloseProblemModal()
                  }}
                />
              )}
          </Suspense>
        </Paper>
      ))}
    </div>
  )
}
