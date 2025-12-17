import React, { useState } from 'react'
import AddQuizToSection from '../components/Quiz/AddQuizToSection'
import AddTestToSection from '../components/Test/AddTestToSection'
import { useParams } from 'react-router-dom'
import { BASE_URL } from '../config/config'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import AddUsers from '../components/Users/AddUsers'

// ✅ MUI Icons
import GroupIcon from '@mui/icons-material/Group'
import QuizIcon from '@mui/icons-material/Quiz'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import SchoolIcon from '@mui/icons-material/School'
import BarChartIcon from '@mui/icons-material/BarChart'
import StudentsTable from '../components/Users/StudentsTable'
import { getGroupOwnerShip } from '../store/selectros/userSelector'
import AddExamForm from './modals/AddExamModal'
import AddQuestionBank from './modals/AddQuestionBankk'

interface Insights {
  totalUsers: number
  totalQuizzes: number
  totalQuizSubmissions: number
  totalTests: number
  totalTestSubmissions: number
}

const fetchInsights = async ({
  sectionId,
  groupId
}: {
  sectionId: string
  groupId: string | undefined
}) => {
  // if (!groupId) return null
  const res = await axios.get(
    `${BASE_URL}/api/campus/insights/${sectionId}/`,
    { withCredentials: true }
  )
  return res.data as Insights
}

const SectionPage: React.FC = () => {
  const [quizOpen, setQuizOpen] = useState(false)
  const [testOpen, setTestOpen] = useState(false)
  const [examOpen, setExamOpen] = useState(false);
  const [questionBank, setQuestionBank] = useState(false);
  const { id } = useParams<string>()
  const groupId = useSelector(getGroupOwnerShip) ?? ""

  // ✅ Single modal for adding users/admins
  const [openAddUserModal, setOpenAddUserModal] = useState(false)
  // const [selectedRole, setSelectedRole] = useState<'campus-admin' | 'user'>('user')

  const {
    data: insights,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['sectionInsights', id, groupId],
    queryFn: () => fetchInsights({ sectionId: id as string, groupId }),
    // enabled: !!id && !!groupId,
    staleTime: 1000 * 60 * 5
  })

  const cards = [
    {
      label: 'Total Users',
      value: insights?.totalUsers ?? 0,
      icon: <GroupIcon className='text-orange-600' />
    },
    {
      label: 'Total Quizzes',
      value: insights?.totalQuizzes ?? 0,
      icon: <QuizIcon className='text-orange-600' />
    },
    {
      label: 'Quiz Submissions',
      value: insights?.totalQuizSubmissions ?? 0,
      icon: <AssignmentTurnedInIcon className='text-orange-600' />
    },
    {
      label: 'Total Tests',
      value: insights?.totalTests ?? 0,
      icon: <SchoolIcon className='text-orange-600' />
    },
    {
      label: 'Test Submissions',
      value: insights?.totalTestSubmissions ?? 0,
      icon: <BarChartIcon className='text-orange-600' />
    }
  ]

  const ActionButton = ({
    onClick,
    label
  }: {
    onClick: () => void
    label: string
  }) => (
    <button
      onClick={onClick}
      className='flex cursor-pointer items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200'
    >
      <span>{label}</span>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        className='w-4 h-4'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
        strokeWidth={2}
      >
        <path strokeLinecap='round' strokeLinejoin='round' d='M12 4v16m8-8H4' />
      </svg>
    </button>
  )

  return (
    <div className='p-6 space-y-8'>
      {/* ✅ Combined Add User/Admin Modal */}
      <AddUsers
        // role={selectedRole}
        open={openAddUserModal}
        setOpen={() => setOpenAddUserModal(false)}
      />

      {/* Action Buttons */}
      <div className='flex flex-wrap gap-4'>
        <ActionButton label='Add Quiz' onClick={() => setQuizOpen(true)} />
        {/* <ActionButton label='Add Test' onClick={() => setTestOpen(true)} /> */}
        <ActionButton label='Add Exam' onClick={() => setExamOpen(true)} />
        <ActionButton label='Add Bank' onClick={() => setQuestionBank(true)} />

        {/* ✅ Combined button with dropdown */}
        <div className='relative group'>
          <ActionButton
            label='Add Members'
            onClick={() => setOpenAddUserModal(true)}
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className='h-24 bg-gray-200 animate-pulse rounded-2xl'
            ></div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className='text-red-600 bg-red-50 border border-red-200 rounded-lg p-4'>
          <p className='font-medium'>Failed to fetch insights.</p>
          <button
            onClick={() => refetch()}
            className='underline text-sm hover:text-red-800'
          >
            Retry
          </button>
        </div>
      )}

      {/* Insights Cards */}
      {!isLoading && !isError && (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6'>
          {cards.map((card, idx) => (
            <div
              key={idx}
              className='bg-white border border-gray-100 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 p-5 flex flex-col items-center text-center'
            >
              <div className='flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-3'>
                {card.icon}
              </div>
              <p className='text-gray-600 text-sm font-medium'>{card.label}</p>
              <p className='text-2xl font-bold text-gray-900 mt-1'>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Quiz Modal */}
      <AddQuizToSection
        open={quizOpen}
        onClose={() => setQuizOpen(false)}
        sectionId={id as string}
      />

      {/* Test Modal */}
      <AddTestToSection
        open={testOpen}
        onClose={() => setTestOpen(false)}
        sectionId={id as string}
      />
      <AddQuestionBank open={questionBank} onClose={() => setQuestionBank(false)} />
      <AddExamForm sectionId={id as string} open={examOpen} onClose={() => setExamOpen(false)} />
      {/* Manage Users */}
      <StudentsTable />
    </div>
  )
}

export default SectionPage
