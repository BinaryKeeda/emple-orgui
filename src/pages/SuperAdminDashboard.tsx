import React, { useState, type FormEvent, type ChangeEvent } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { BASE_URL, LOGO } from '../config/config'
import { useNavigate } from 'react-router-dom'
import {
  Add,
  ArrowRight,
  CloudUpload,
  Check,
  Delete,
  Search,
} from '@mui/icons-material'
import {
  Modal,
  Tooltip,
  TextField,
  Button,
  Typography,
  Slider,
  IconButton,
  Backdrop,
  CircularProgress,
  Skeleton,
  Box,
  InputAdornment,
  DialogActions,
  Dialog,
  DialogTitle,
  DialogContent,
  Pagination,
  Checkbox,
} from '@mui/material'
import Cropper from 'react-easy-crop'
import { useLogout } from '../hooks/useLogout'
import { getGroupOwnerShip } from '../store/selectros/userSelector'
import useSections from './hooks/useSections'
import type { RootState } from '../store/store'
import { useSnackbar } from 'notistack'
import AccountMenu from './modals/AccountMenu'
import DeleteConfirmBox from '../Layout/DeleteConfirmBox'

/* ----------------------------- Helper function ---------------------------- */
const getCroppedImg = async (imageSrc: string, crop: any, zoom: number) => {
  const image = new Image()
  image.src = imageSrc
  await new Promise(resolve => (image.onload = resolve))

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  const size = Math.min(image.width, image.height)
  canvas.width = size
  canvas.height = size

  const x = (crop.x * image.width) / 100
  const y = (crop.y * image.height) / 100

  ctx.drawImage(
    image,
    x,
    y,
    size / zoom,
    size / zoom,
    0,
    0,
    canvas.width,
    canvas.height
  )

  return new Promise<File>(resolve => {
    canvas.toBlob(blob => {
      if (blob) {
        resolve(new File([blob], 'cropped-logo.png', { type: 'image/png' }))
      }
    }, 'image/png')
  })
}

/* ---------------------------- LogoUploader ---------------------------- */
const LogoUploader = ({ onSave }: { onSave: (file: File) => void }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader()
      reader.onload = () => setImageSrc(reader.result as string)
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleSave = async () => {
    if (!imageSrc) return
    const croppedFile = await getCroppedImg(imageSrc, crop, zoom)
    onSave(croppedFile)
    setImageSrc(null)
  }

  return (
    <div>
      {!imageSrc ? (
        <Button
          component="label"
          variant="outlined"
          startIcon={<CloudUpload />}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Upload Logo
          <input type="file" accept="image/*" hidden onChange={onFileChange} />
        </Button>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative w-72 h-72 bg-black">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
            />
          </div>
          <Slider
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(_, v) => setZoom(v as number)}
            sx={{ width: 200, mt: 2 }}
          />
          <Button
            variant="contained"
            startIcon={<Check />}
            onClick={handleSave}
            sx={{
              mt: 2,
              background: 'linear-gradient(90deg, #007BFF 0%, #004A99 100%)',
            }}
          >
            Save Logo
          </Button>
        </div>
      )}
    </div>
  )
}

/* ------------------------- Create Section Modal ------------------------- */
const CreateSectionModal = ({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (name: string, logoFile?: File) => void
}) => {
  const [name, setName] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onCreate(name, logoFile || undefined)
    setName('')
    setLogoFile(null)
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-20">
        <Typography variant="h6" align="center" gutterBottom>
          Create Section
        </Typography>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="Section Name"
            value={name}
            onChange={e => setName(e.target.value)}
            variant="outlined"
            fullWidth
            required
          />
          <LogoUploader onSave={setLogoFile} />
          {logoFile && (
            <div className="flex justify-center mt-2">
              <img
                src={URL.createObjectURL(logoFile)}
                alt="Cropped Logo"
                className="h-24 w-24 object-contain rounded border p-1 border-gray-300"
              />
            </div>
          )}
          <Button
            type="submit"
            variant="contained"
            sx={{
              background: 'linear-gradient(90deg, #007BFF 0%, #004A99 100%)',
              color: '#fff',
              borderRadius: 2,
            }}
          >
            Create <Add />
          </Button>
        </form>
      </div>
    </Modal>
  )
}

// const 

/* --------------------------- Section Card --------------------------- */
const SectionCard = ({
  section,
  onDelete,
}: {
  section: any
  onDelete: (id: string) => void
}) => {
  const [imgLoaded, setImgLoaded] = useState(false)
  const navigate = useNavigate()

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    onDelete(section._id);
  }


  return (
    <div className="relative flex flex-col rounded-xl bg-white text-gray-700 shadow-md hover:shadow-lg transition-transform hover:scale-[1.02]">
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
        <Tooltip title="Delete" arrow>
          <IconButton
            size="small"
            onClick={handleDelete}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: '#fff',
              background: 'rgba(0,0,0,0.4)',
              '&:hover': { background: 'rgba(255,0,0,0.6)' },
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
      <div className="px-6 pt-4 pb-2 text-center">
        <Typography variant="h6" className="font-semibold">
          {section.name}
        </Typography>
      </div>
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
            borderRadius: 2,
          }}
        >
          Proceed
        </Button>
      </div>
      <DeleteConfirmBox
        open={confirmDelete}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Section"
        message={`Are you sure you want to delete the section "${section.name}"? This action cannot be undone.`}

      />
    </div>
  )
}


type NotificationForm = {
  userId: string;
  groupId: string;
  sectionId: string[];
  text: string;
};

// --------------------- COMPONENT --------------------- //

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: (data: any) => void;
};
function NotificationModal({ open, onClose, onSuccess }: Props) {
  const groupId = useSelector(getGroupOwnerShip) ?? "";
  const user = useSelector((s: RootState) => s.auth.user);

  const [loading, setLoading] = useState(false);

  // Pagination + Search
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading: loadingSections } = useSections(groupId, {
    page,
    limit,
    search,
    userId: user?.user?._id,
  });

  const sections = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, totalPages: 1 };

  const [form, setForm] = useState<NotificationForm>({
    userId: user?.user._id || "",
    groupId,
    sectionId: [],
    text: "",
  });

  const toggleSection = (id: string) => {
    setForm((prev) => {
      const exists = prev.sectionId.includes(id);
      return {
        ...prev,
        sectionId: exists
          ? prev.sectionId.filter((x) => x !== id)
          : [...prev.sectionId, id],
      };
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const res = await axios.post(`${BASE_URL}/api/campus/notification/create`, form);

      if (res.data.success) {
        onSuccess?.(res.data.notification);
        onClose();

        setForm({
          userId: user?.user._id || "",
          groupId,
          sectionId: [],
          text: "",
        });
      }
    } catch (err) {
      alert("Failed to add notification");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Notification</DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>

          {/* Notification Text */}
          <TextField
            label="Notification Text"
            value={form.text}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, text: e.target.value }))
            }
            multiline
            minRows={2}
            fullWidth
          />

          {/* Search */}
          <TextField
            label="Search Sections"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            fullWidth
          />

          {/* SECTION CHECKBOX LIST */}
          <Box
            sx={{
              border: "1px solid #e5e5e5",
              borderRadius: 1,
              p: 1,
              maxHeight: 270,
              overflowY: "auto",
            }}
          >
            {loadingSections ? (
              <Typography textAlign="center" p={2}>
                Loading...
              </Typography>
            ) : sections.length === 0 ? (
              <Typography textAlign="center" p={2}>
                No sections found
              </Typography>
            ) : (
              sections.map((section: any) => (
                <Box
                  key={section._id}
                  display="flex"
                  alignItems="center"
                  gap={1}
                  p={1}
                >
                  <Checkbox
                    checked={form.sectionId.includes(section._id)}
                    onChange={() => toggleSection(section._id)}
                  />
                  <Typography>{section.name}</Typography>
                </Box>
              ))
            )}
          </Box>

          {/* Pagination */}
          <Box display="flex" justifyContent="center" mt={1}>
            <Pagination
              count={pagination.totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={22} /> : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}


/* ------------------------------- SuperAdminDashboard ------------------------------ */
const SuperAdminDashboard: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20); // static limit

  const logout = useLogout();
  const user = useSelector((s: RootState) => s.auth.user);
  const groudId = useSelector(getGroupOwnerShip);
  const userId = user?.user?.role === "campus-admin" ? user?.user?._id : undefined;
  const { enqueueSnackbar } = useSnackbar();
  const [brodcast, setBrodcast] = useState(false);

  // 🚀 Pagination-enabled hook
  const { data, error, isLoading, refetch } = useSections(groudId ?? "", {
    page,
    limit,
    search: searchQuery,
    userId,
  });

  if (error) return <>{JSON.stringify(error)}</>;

  const sections = data?.data || [];
  const pagination = data?.pagination;

  const handleCreateSection = async (name: string, logoFile?: File) => {
    if (!groudId) return setMessage("No group assigned");
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("groupId", groudId);
      if (logoFile) formData.append("logo", logoFile);

      await axios.post(BASE_URL + "/api/campus/create/section", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      enqueueSnackbar("Section created successfully!", { variant: "success" });
      setModalOpen(false);
      await refetch();
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Error creating section");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);

      await axios.post(BASE_URL + "/api/campus/delete/section/" + id, {}, { withCredentials: true });

      enqueueSnackbar("Section deleted successfully!", { variant: "success" });
      await refetch();
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Error deleting section");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Global Loader */}
      <Backdrop
        open={loading}
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress color="inherit" />
        <Typography variant="body2">Please wait... Processing your request</Typography>
      </Backdrop>

      {/* Header */}
      <header className="p-2 border-b border-b-[#e1e1e1] flex flex-wrap gap-3 items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <img src={LOGO} className="h-10" alt="Logo" />

          <TextField
            placeholder="Search sections..."
            size="small"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1); // reset to page 1 on search
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 240 }}
          />
        </div>

        <div className="flex gap-4 items-center">
          <Button
            onClick={() => setModalOpen(true)}
            sx={{
              width: 180,
              fontSize: 10,
              height: 36,
              background: "linear-gradient(90deg, #007BFF 0%, #004A99 100%)",
              color: "#fff",
            }}
          >
            Create New Section <Add />
          </Button>

          <Button
            onClick={() => setBrodcast(true)}
            sx={{
              width: "max-content",
              fontSize: 10,
              padding: "6px 12px",
              height: 36,
              background: "linear-gradient(90deg, #007BFF 0%, #004A99 100%)",
              color: "#fff",
            }}
          >
            Notify <Add />
          </Button>

          <AccountMenu
            onLogout={logout}
            name={user?.user?.name || ""}
            email={user?.user?.email || ""}
            profilePic={user?.user?.avatar || null}
          />
        </div>
      </header>

      {message && (
        <Typography color="success.main" className="px-5 mt-2">
          {message}
        </Typography>
      )}

      {/* Paginated Section Grid */}
      {isLoading ? (
        <Box className="grid grid-cols-1 p-5 mt-4 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Box key={i} className="rounded-xl shadow-md bg-white p-3">
              <Skeleton variant="rectangular" height={150} animation="wave" />
              <Skeleton variant="text" height={30} sx={{ mt: 2 }} />
              <Skeleton variant="rounded" height={36} width="60%" sx={{ mt: 1 }} />
            </Box>
          ))}
        </Box>
      ) : sections.length ? (
        <>
          <div className="grid grid-cols-1 p-5 mt-4 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {sections.map((section: any) => (
              <SectionCard key={section._id} section={section} onDelete={handleDelete} />
            ))}
          </div>

          {/* Pagination */}
          <Box className="flex justify-center my-5">
            <Pagination
              count={pagination?.totalPages || 1}
              page={page}
              onChange={(_, val) => setPage(val)}
              color="primary"
            />
          </Box>
        </>
      ) : (
        <div className="p-6 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
          <Typography variant="body1" gutterBottom>
            {searchQuery ? `No results found for "${searchQuery}"` : "No sections created yet."}
          </Typography>
        </div>
      )}

      {/* Modals */}
      <CreateSectionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateSection}
      />

      <NotificationModal
        open={brodcast}
        onClose={() => setBrodcast(false)}
        onSuccess={async () => {
          enqueueSnackbar("Notification created successfully!", { variant: "success" });
          setBrodcast(false);
        }}
      />
    </>
  );
};


export default SuperAdminDashboard
