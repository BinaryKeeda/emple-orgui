import {
  BallotOutlined,
  DashboardOutlined,
  QuizOutlined,
} from '@mui/icons-material'
import React from 'react'
import { useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import type { RootState } from '../store/store'

type NavItem = {
  icon: React.ReactNode
  label: string
  path: string
  type: 'private' | 'public'
  upcoming?: boolean
}

interface DrawerProps {
  showMenu: boolean
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>
  sectionId: string,
  drawerWidth: number
}

const Drawer: React.FC<DrawerProps> = React.memo(
  ({ showMenu, sectionId , drawerWidth}) => {
    const { user } = useSelector((s: RootState) => s.auth)
    const path = useLocation()

    const NAV_ITEMS: NavItem[] = [
      {
        icon: <DashboardOutlined sx={{ fontSize: '20px' }} />,
        label: 'Section',
        path: `/dashboard/section/${sectionId}`,
        type: 'private',
      },
      {
        icon: <QuizOutlined sx={{ fontSize: '20px' }} />,
        label: 'Quiz',
        path: `/dashboard/section/${sectionId}/quiz`,
        type: 'private',
      },
      {
        icon: <BallotOutlined sx={{ fontSize: '20px' }} />,
        label: 'Test',
        path: `/dashboard/section/${sectionId}/test`,
        type: 'private',
      },
    ]

    return (
      <aside
        className={`
          z-40 h-[calc(100vh)] top-0 fixed left-0 
          bg-[#1B1A1D] text-gray-300
          transition-all duration-300 ease-in-out
          ${showMenu ? 'lg:w-[180px] md:w-[120px]' : 'w-0 lg:w-[90px]'}
          overflow-hidden
        `}
        style={{ width: `${drawerWidth}px` }}
      >
        <ul className="">
          {NAV_ITEMS.map((item, i) => {
            const isActive = item.path === path.pathname
            if (!user && item.type === 'private') return null

            return (
              <Link
                to={item.upcoming ? '' : item.path}
                key={i}
                className={`
                  relative flex flex-col items-center gap-1 px-3 py-3
                   transition-all duration-300 ease-in-out
                  ${showMenu ? 'justify-start' : 'lg:justify-center'}
                  ${item.upcoming ? 'cursor-not-allowed opacity-50' : ''}
                  ${
                    isActive
                      ? 'bg-gradient-to-r bg-black/90 text-white shadow-md'
                      : 'hover:bg-orange-500/20 hover:text-orange-200'
                  }
                  ${!showMenu ? 'hidden lg:flex' : ''}
                `}
              >
                {/* Icon */}
                <span
                  className={`flex items-center justify-center w-8 h-8 ${
                    isActive ? 'text-white' : 'text-gray-300'
                  }`}
                >
                  {item.icon}
                </span>

                {/* Badge for upcoming */}
                {item.upcoming && (
                  <span className="absolute top-1 right-2 text-[9px] px-1 py-0.5 rounded bg-orange-600 text-white font-semibold">
                    Soon
                  </span>
                )}

                {/* Label */}
                <span
                  className={`text-xs font-medium ${
                    isActive ? 'text-white' : 'text-gray-300'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </ul>
      </aside>
    )
  }
)

export default Drawer
