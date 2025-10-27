import React, { useState } from 'react'
import axios from 'axios'
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button
} from '@mui/material'
import { BASE_URL } from '../../../lib/config'

function AddGroupAdminModal({ open = true, onClose }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [groupName, setGroupName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAssign = async () => {
    if (!email || !groupName || !name) return

    try {
      setLoading(true)
      const res = await axios.post(
        `${BASE_URL}/api/admin/groups/assign-owner`,
        { email, name, groupName }, // ✅ now includes name
        { withCredentials: true }
      )

      setMessage(
        `✅ Assigned ${email} (${name}) as campus-superadmin & owner of ${res.data.group.groupName}`
      )

      // Clear fields
      setEmail('')
      setName('')
      setGroupName('')
      onClose()
    } catch (err) {
      console.error('Error assigning group owner:', err)
      setMessage(
        `❌ Failed to assign owner: ${err.response?.data?.message || err.message}`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4
        }}
      >
        <Typography variant='h6' mb={2}>
          Assign Group Owner
        </Typography>

        <TextField
          label='Name'
          fullWidth
          margin='normal'
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <TextField
          label='User Email'
          fullWidth
          margin='normal'
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <TextField
          label='Group Name'
          fullWidth
          margin='normal'
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
        />

        <Button
          variant='contained'
          fullWidth
          onClick={handleAssign}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? 'Assigning...' : 'Assign Owner'}
        </Button>

        {message && (
          <Typography variant='body2' mt={2}>
            {message}
          </Typography>
        )}
      </Box>
    </Modal>
  )
}

export default AddGroupAdminModal
