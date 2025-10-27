import { Close } from '@mui/icons-material'
import { Button, IconButton } from '@mui/material'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import { BASE_URL } from '../../config/config'
import { jsonToFormattedData } from '../utils/lib/jsonParser'

interface Option {
  text: string
  isCorrect: boolean
}

interface QuestionData {
  question: string
  category: 'MCQ' | 'MSQ' | 'Text'
  marks: number
  negative: number
  options?: Option[]
  answer?: string
}

interface AddQuestionJsonProps {
  onSuccess: () => void
  onError: () => void
  setModalClose: (val: boolean) => void
  id: string
}

export default function AddQuestionJson({
  onSuccess,
  onError,
  setModalClose,
  id
}: AddQuestionJsonProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [previewData, setPreviewData] = useState<QuestionData[]>([])

  const { getRootProps, getInputProps } = useDropzone({
    onDropAccepted: async (acceptedFiles: File[]) => {
      const selected = acceptedFiles[0]
      setFile(selected)
      try {
        const parsed = await jsonToFormattedData(selected, id)
        setPreviewData(parsed)
      } catch (err) {
        console.error(err)
        alert('Invalid JSON format')
      }
    },
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach((file) => {
        console.log(`${file.file.name} has an invalid MIME type.`)
      })
    },
    accept: { 'application/json': ['.json'] }
  })

  const uploadJson = async () => {
    if (!previewData.length) return
    setLoading(true)
    try {
      const res = await axios.post(
        `${BASE_URL}/api/admin/quiz/add/questions`,
        { quizId: id, data: previewData },
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      )
      console.log(res.data)
      onSuccess()
      setModalClose(true)
    } catch (error) {
      console.error(error)
      onError()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='h-screen w-screen bg-opacity-25 px-36 py-24 bg-black fixed top-0 left-0 z-[2099]'>
      <div className='rounded-md relative h-full w-full transition-all ease-linear duration-300 bg-white overflow-y-auto'>
        <div className='flex justify-end'>
          <IconButton onClick={() => setModalClose(true)}>
            <Close />
          </IconButton>
        </div>

        <div className='mt-6 bg-blue-50 border border-blue-300 rounded-md p-4'>
          <h2 className='text-base font-semibold mb-2'>Expected JSON Schema Example:</h2>
          <pre className='bg-white text-xs rounded-md p-3 overflow-x-auto whitespace-pre-wrap'>
{`[
  {
    "question": "What is the capital of France?",
    "category": "MCQ",
    "marks": 2,
    "negative": 0.5,
    "options": [
      { "text": "Paris", "isCorrect": true },
      { "text": "London", "isCorrect": false },
      { "text": "Berlin", "isCorrect": false },
      { "text": "Madrid", "isCorrect": false }
    ]
  },
  {
    "question": "Define gravity.",
    "category": "Text",
    "marks": 5,
    "negative": 0,
    "answer": "Gravity is the force that attracts a body toward the center of the earth."
  }
]`}
          </pre>
        </div>

        <section className='p-5 gap-5'>
          <div
            className='p-10 cursor-pointer flex-1 flex justify-center border-dashed border-2 border-black'
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            {file ? (
              <small>{file.name}</small>
            ) : (
              <small>Upload here (Only .json supported)</small>
            )}
          </div>

          {previewData.length > 0 && (
            <div className='mt-4 bg-gray-100 rounded-md p-4 max-h-[300px] overflow-y-auto'>
              <h2 className='text-lg font-semibold mb-2'>Preview Questions:</h2>
              <ul className='list-disc pl-5 space-y-2 text-sm'>
                {previewData.map((item, index) => (
                  <li key={index}>
                    <strong>Q{index + 1}:</strong> {item.question} —{' '}
                    <i>{item.category}</i> ({item.marks} marks)
                  </li>
                ))}
              </ul>
            </div>
          )}

          {file && previewData.length > 0 && (
            <Button
              onClick={uploadJson}
              sx={{ marginTop: '10px' }}
              variant='contained'
              color='primary'
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Validate & Upload'}
            </Button>
          )}
        </section>
      </div>
    </div>
  )
}
