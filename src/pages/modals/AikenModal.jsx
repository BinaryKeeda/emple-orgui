// AikenModal.jsx
import React, { useState } from 'react'
import { Button, TextField } from '@mui/material'
import { BASE_URL } from '../../../lib/config'
import axios from 'axios'
import { parseAikenFormat } from '../utils/aikenParser' // Adjust the import path as needed

export default function AikenModal({ id, setModalClose }) {
  const [aikenText, setAikenText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpload = async () => {
    setLoading(true)

    try {
      const parsedQuestions = parseAikenFormat(aikenText)

      const response = await axios.post(
        `${BASE_URL}/api/v1/quiz/upload/aiken`,
        {
          quizId: id,
          questions: parsedQuestions
        },
        { withCredentials: true }
      )

      alert('Uploaded Aiken questions successfully')
      setModalClose(true)
      window.location.reload()
    } catch (err) {
      console.error(err)
      alert('Failed to upload Aiken content')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed top-0 left-0 h-screen w-screen bg-black bg-opacity-40 flex justify-center items-center z-[999]'>
      <div className='bg-white p-6 rounded-md max-w-2xl w-full'>
        <h2 className='text-lg font-bold mb-3'>Paste Aiken Format Questions</h2>
        <TextField
          fullWidth
          multiline
          rows={15}
          value={aikenText}
          onChange={e => setAikenText(e.target.value)}
          placeholder={`Example:\n[MSQ]\nWhich are fruits?\nA. Apple\nB. Carrot\nC. Mango\nD. Potato\nANSWER: A,C`}
        />
        <div className='flex justify-end gap-2 mt-4'>
          <Button onClick={() => setModalClose(true)} color='secondary'>Cancel</Button>
          <Button onClick={handleUpload} variant='contained' disabled={loading}>
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>
    </div>
  )
}