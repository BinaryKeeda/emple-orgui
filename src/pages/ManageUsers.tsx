// import { useState } from 'react'
// import AddUsers from '../components/Users/AddUsers'
import StudentsTable from '../components/Users/StudentsTable'
import { useParams } from 'react-router-dom'

export default function ManageUsers () {
  // const [open, setOpen] = useState<boolean>(false)
  // const [role, setRole] = useState<'campus-admin' | 'user'>('user')
  const { id } = useParams<string>()
  return (
    <>
      {/* <div
        className='w-full flex gap-4 m-5 rounded-md shadow-sm px-5 py-2 '
        style={{ border: '1px solid #f1f1f1' }}
      >
        <button
          onClick={() => {
            setRole('user')
            setOpen(true)
          }}
          className='flex cursor-pointer items-center gap-2 px-4 py-2 rounded-full bg-orange-600 text-white text-sm font-medium shadow-md hover:bg-orange-700 hover:shadow-lg transition-all duration-200'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='w-4 h-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M12 4v16m8-8H4'
            />
          </svg>
          Add Students
        </button>
        <button
          onClick={() => {
            setRole('campus-admin')
            setOpen(true)
          }}
          className='flex cursor-pointer items-center gap-2 px-4 py-2 rounded-full bg-orange-600 text-white text-sm font-medium shadow-md hover:bg-orange-700 hover:shadow-lg transition-all duration-200'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='w-4 h-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M12 4v16m8-8H4'
            />
          </svg>
          Add Admin
        </button>
      </div> */}
      {/* <AddUsers
        role={role}
        open={open}
        setOpen={() => {
          setOpen(false)
        }}
      /> */}
      <StudentsTable sectionId={id as string} />
    </>
  )
}
