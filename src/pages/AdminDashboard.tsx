import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { BASE_URL, LOGO } from '../config/config'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Logout, Delete } from '@mui/icons-material'
import { Tooltip, Button, Typography, IconButton, Skeleton, Box } from '@mui/material'
import { useLogout } from '../hooks/useLogout'
import type { RootState } from '../store/store'

/* --------------------------- Section Card --------------------------- */
const SectionCard = ({
  section,
  onDelete
}: {
  section: { _id: string; name: string; logo: string }
  onDelete: () => void
}) => {
  const [imgLoaded, setImgLoaded] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="relative flex flex-col rounded-xl bg-white text-gray-700 shadow-md hover:shadow-lg transition-transform hover:scale-[1.02]">
      {/* Logo */}
      <div className="relative h-40 flex items-center justify-center bg-gradient-to-r rounded-t-xl overflow-hidden">
        {!imgLoaded && section.logo && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
            <Typography variant="body2" color="textSecondary">
              Loading...
            </Typography>
          </div>
        )}
        {section.logo ? (
          <img
            src={section.logo}
            alt={section.name}
            className="h-full w-full object-cover"
            onLoad={() => setImgLoaded(true)}
          />
        ) : (
          <Typography variant="h4" className="text-gray-900 font-bold">
            {section.name[0]}
          </Typography>
        )}

        {/* Delete Button */}
        <Tooltip title="Delete" arrow>
          <IconButton
            size="small"
            onClick={onDelete}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: '#fff',
              background: 'rgba(0,0,0,0.4)',
              '&:hover': { background: 'rgba(255,0,0,0.6)' }
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>

      {/* Title */}
      <div className="px-6 pt-4 pb-2 text-center">
        <Typography variant="h6" className="font-semibold">
          {section.name}
        </Typography>
      </div>

      {/* Action */}
      <div className="flex justify-center pb-4">
        <Button
          onClick={() => {
            localStorage.setItem('sectionId', section._id)
            navigate('section/' + section._id)
          }}
          endIcon={<ArrowRight />}
          sx={{
            px: 3,
            py: 1,
            fontSize: 12,
            background: 'linear-gradient(90deg, #007BFF 0%, #004A99 100%)',
            color: '#fff',
            borderRadius: 2
          }}
        >
          Proceed
        </Button>
      </div>
    </div>
  )
}

/* --------------------------- SectionCard Skeleton --------------------------- */
const SectionSkeleton = () => (
  <Box className="flex flex-col rounded-xl bg-white shadow-md p-4">
    <Skeleton variant="rectangular" height={150} animation="wave" />
    <Skeleton variant="text" width="80%" sx={{ mt: 2, mx: 'auto' }} />
    <Skeleton variant="rectangular" width="50%" height={36} sx={{ mt: 2, mx: 'auto', borderRadius: 1 }} />
  </Box>
)

/* ------------------------------- Dashboard ------------------------------ */
const Dashboard: React.FC = () => {
  const [message, setMessage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const logout = useLogout()
  const user = useSelector((s: RootState) => s.auth.user)

  useEffect(() => {
    // Simulate data loading delay (replace this with real fetch logic if needed)
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  const handleDelete = async (ownershipId: string) => {
    try {
      await axios.post(BASE_URL + '/api/campus/delete/section/' + ownershipId, {}, { withCredentials: true })
      setMessage('Section deleted successfully!')
    } catch (err: any) {
      console.error(err)
      setMessage(err.response?.data?.message || 'Error deleting section')
    }
  }

  return (
    <>
      {/* Header */}
      <header className="p-2 border-b border-b-[#e1e1e1] flex gap-3 items-center justify-between px-5">
        <img src={LOGO} className="h-10" alt="Logo" />
        <div className="flex gap-4 items-center">
          <Tooltip title="Logout" arrow>
            <IconButton onClick={logout} size="small" sx={{ color: '#f44336' }}>
              <Logout sx={{ cursor: 'pointer' }} />
            </IconButton>
          </Tooltip>
        </div>
      </header>

      {/* Main Content */}
      {message && (
        <Typography color="success.main" className="px-5 mt-2">
          {message}
        </Typography>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 p-5 mt-4 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <SectionSkeleton key={i} />
          ))}
        </div>
      ) : Array.isArray(user?.ownership) && user.ownership.length ? (
        <div className="grid grid-cols-1 p-5 mt-4 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {user.ownership.map((o: any) => (
            <SectionCard
              key={o.section._id}
              section={o.section}
              onDelete={() => handleDelete(o._id)}
            />
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
          <Typography variant="body1" gutterBottom>
            Admin, no sections have been created yet.
          </Typography>
          <Typography variant="body2">Ask your admin to create sections.</Typography>
        </div>
      )}
    </>
  )
}

export default Dashboard
