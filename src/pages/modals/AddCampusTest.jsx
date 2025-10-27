import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Select,
  InputLabel,
  FormControl,
  Autocomplete
} from '@mui/material'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { BASE_URL } from '../../../lib/config'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'

const visibilityOptions = ['private', 'public', 'group']

export default function CreateTestModal ({ onClose }) {
  const [name, setTitle] = useState('')
  const [visibility, setVisibility] = useState('private')
  const [isAvailable, setIsAvailable] = useState(false)
  const [groupId, setGroupId] = useState('')
  const [groups, setGroups] = useState([])
  const [groupQuery, setGroupQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const {enqueueSnackbar} = useSnackbar();
  // Fetch groups based on query
  const fetchGroups = async (query = '') => {
    try {
      setLoading(true)
      const res = await axios.get(
        `${BASE_URL}/api/admin/groups?search=${query}&withOwner=false`,
        {
          withCredentials: true
        }
      )

      const campusGroups = res.data.groups
      console.log('Fetched campus groups:', campusGroups)

      setGroups(campusGroups)
    } catch (err) {
      console.error('Error fetching groups:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch initially and on search change
  useEffect(() => {
    fetchGroups(groupQuery)
  }, [groupQuery])

  // Fetch once when modal opens
  useEffect(() => {
    fetchGroups('')
  }, [])

  const navigate = useNavigate()
  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/admin/campus/test/add`,
        {
          name,
          visibility,
          isAvailable,
          groupId
        },
        { withCredentials: true }
      )

      const campusId = res.data.test._id
      navigate('/admin/edit/campustest/' + campusId)
      enqueueSnackbar('Campus test created successfully 🎉', {
        variant: 'success'
      })
      onClose()
    } catch (err) {
      console.error('Error creating test', err)
      enqueueSnackbar('Failed to create campus test ❌', { variant: 'error' })
    }
  }

  return (
    <Dialog open={true} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Create New Test</DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          label='Name'
          value={name}
          onChange={e => setTitle(e.target.value)}
          margin='normal'
        />

        <FormControl fullWidth margin='normal'>
          <InputLabel>Visibility</InputLabel>
          <Select
            value={visibility}
            label='Visibility'
            onChange={e => setVisibility(e.target.value)}
          >
            {visibilityOptions.map(opt => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin='normal'>
          <Autocomplete
            options={groups}
            getOptionLabel={option => option.groupName || ''}
            onInputChange={(e, value) => setGroupQuery(value)}
            onChange={(e, newValue) => setGroupId(newValue?._id || '')}
            loading={loading}
            renderInput={params => (
              <TextField
                {...params}
                label='Search Campus Groups'
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading && (
                        <CircularProgress color='inherit' size={20} />
                      )}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
          />
        </FormControl>

        <FormControl fullWidth margin='normal'>
          <TextField
            label='Availibility'
            select
            native
            value={isAvailable}
            onChange={e => setIsAvailable(e.target.value === 'true')}
          >
            <MenuItem value='false'>No</MenuItem>
            <MenuItem value='true'>Yes</MenuItem>
          </TextField>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant='contained' onClick={handleSubmit}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}
