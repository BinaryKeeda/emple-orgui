import  { useEffect, useState  } from 'react'
import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText
} from '@mui/material'
import axios from 'axios'
import { BASE_URL } from '../../config/config'

const modalStyle = {
  position: 'absolute' as const,
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

interface Problem {
  _id: string
  title: string
  difficulty: string
  [key: string]: any
}

interface AddProblemModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  testId: string
  sectionId: string
}

export default function AddProblemModal({
  open,
  onClose,
  onSuccess,
  testId,
  sectionId
}: AddProblemModalProps) {
  const [problems, setProblems] = useState<Problem[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  // const observer = useRef<IntersectionObserver | null>(null)

  // const lastProblemRef = useCallback(
  //   (node: HTMLDivElement | null) => {
  //     if (loading) return
  //     if (observer.current) observer.current.disconnect()

  //     observer.current = new IntersectionObserver(entries => {
  //       if (entries[0].isIntersecting && hasMore) {
  //         setPage(prevPage => prevPage + 1)
  //       }
  //     })

  //     if (node) observer.current.observe(node)
  //   },
  //   [loading, hasMore]
  // )

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true)
      try {
        const res = await axios.get(
          `${BASE_URL}/api/admin/problems?search=&category=&difficulty=&isAvailable=&page=${page}&limit=10&sortBy=createdAt&sortOrder=desc`,
          { withCredentials: true }
        )
        const newProblems: Problem[] = res.data.data || []

        setProblems(prev => [...prev, ...newProblems])
        setHasMore(newProblems.length > 0)
      } catch (err) {
        console.error('Error fetching problems:', err)
        setHasMore(false)
      } finally {
        setLoading(false)
      }
    }

    if (open) fetchProblems()
  }, [page, open])

  const handleSelectProblem = async (problemId: string) => {
    try {
      await axios.post(
        `${BASE_URL}/api/admin/tests/${testId}/sections/${sectionId}/problem`,
        { problemId },
        { withCredentials: true }
      )
      alert('Problem added successfully!')
      onSuccess()
      handleClose()
    } catch (err) {
      console.error('Failed to add problem:', err)
      alert('Failed to add problem')
    }
  }

  const handleClose = () => {
    setProblems([])
    setPage(1)
    setHasMore(true)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant='h6' mb={2}>
          Select Problem to Add
        </Typography>

        <List>
          {problems.map((problem) => {
            // const isLast = problems.length === index + 1
            return (
              <ListItem
                key={problem._id}
                // ref={isLast ? lastProblemRef : null}
                divider
                secondaryAction={
                  <Button
                    size='small'
                    variant='contained'
                    onClick={() => handleSelectProblem(problem._id)}
                  >
                    Add
                  </Button>
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
      </Box>
    </Modal>
  )
}
