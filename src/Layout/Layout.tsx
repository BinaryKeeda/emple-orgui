import React, { useEffect, useState } from 'react'
import Header from './Header'
import Drawer from './Drawer'
import { Outlet, useParams } from 'react-router-dom'

export const DRAWER_WIDTH = {
  expanded: 150,
  collapsed: 87,
}

const Layout: React.FC = () => {
  const {id } = useParams();
  const [showMenu, setShowMenu] = useState<boolean>(false)
  const [sectionId, setSectionId] = useState<string>("");
  useEffect(() => {
    setSectionId(String(id));
  } , [id]);
  const currentDrawerWidth = showMenu
    ? DRAWER_WIDTH.expanded
    : DRAWER_WIDTH.collapsed

  return (
    <>
      <Header drawerWidth={currentDrawerWidth} />

      <Drawer drawerWidth={currentDrawerWidth} sectionId={sectionId} setShowMenu={setShowMenu} showMenu={showMenu} />

      <main
        className="p-5 transition-all duration-300 ease-in-out"
        style={{ paddingLeft: `${currentDrawerWidth+10}px` }}
      >
        <Outlet />
      </main>
    </>
  )
}

export default Layout
