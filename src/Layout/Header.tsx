import { LOGO } from '../config/config'
import { IconButton, Tooltip } from '@mui/material'
import { Logout, Dashboard } from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { useLogout } from '../hooks/useLogout'

interface HeaderProps {
  drawerWidth: number
}

export default function Header({ drawerWidth }: HeaderProps) {
  const logout = useLogout();
  return (
    <header
      className="relative z-40  right-0 h-[60px]"
      style={{ width: `calc(100vw - ${drawerWidth}px)` }}
    >
      <nav
        className="fixed top-0 right-0 flex items-center justify-between bg-white shadow-md px-6 h-[60px] z-50"
        style={{ width: `calc(100vw - ${drawerWidth}px)` }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={LOGO} className="h-9 w-auto" alt="logo" />

        </div>

        {/* Right Menu */}
        <div className="flex items-center gap-6">
          {/* Dashboard Link */}
          <Link
            to="/"
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-600 transition"
          >
            <Dashboard fontSize="small" />
            Dashboard
          </Link>

          {/* Logout Button */}
          <Tooltip title="Logout" arrow>
            <IconButton
              onClick={logout}
              sx={{
                color: '#fff',
                bgcolor: 'error.main',
                '&:hover': { bgcolor: 'error.dark' },
                padding: '6px',
                borderRadius: '12px',
                boxShadow: 2,
              }}
            >
              <Logout fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </nav>
    </header>
  )
}
