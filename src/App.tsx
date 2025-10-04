// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import React, { Suspense, useEffect } from 'react'
import Layout from './Layout/Layout'
import { useDispatch, useSelector } from 'react-redux'
import { type RootState, type AppDispatch } from './store/store'
import { fetchProfile } from './store/thunks/userThunks'
import { RoleBasedRoute, UserRoute } from './auth/ProtectedRoute'
import Loader from './Layout/Loader'

// Pages (lazy imports)
const Login = React.lazy(() => import('./pages/Login'))
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const SectionEdit = React.lazy(() => import('./pages/SectionEdit'))
const QuizList = React.lazy(() => import('./pages/QuizList'))
const TestList = React.lazy(() => import('./pages/TestList'))
const ManageUsers = React.lazy(() => import('./pages/ManageUsers'))

// Simple inline components (no need for lazy)
const EditQuiz = React.lazy(() => import('./pages/QuizEdit'));
const EditTest = React.lazy(() => import('./pages/TestEdit'));

const PreviewQuiz = React.lazy(() => import('./pages/QuizPreview'));
const PreviewTest = React.lazy(() => import('./pages/TestPreview'));

const App: React.FC = () => {
  const { loading } = useSelector((s: RootState) => s.auth)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(fetchProfile())
  }, [dispatch])

  if (loading) return <><Loader/></>

  return (
    <Router>
      <Suspense fallback={<><Loader/></>}>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<UserRoute />}>
            <Route index element={<Login />} />
          </Route>

          {/* Superadmin-only dashboard */}
          <Route
            path="/dashboard"
            element={<RoleBasedRoute requiredRole={['campus-superadmin' , 'campus-admin']} />}
          >
            <Route index element={<Dashboard />} />
          </Route>

          {/* Admin + Superadmin dashboard */}
          <Route
            element={
              <RoleBasedRoute requiredRole={['campus-admin', 'campus-superadmin']} />
            }
          >
            <Route path="dashboard/section/:id" element={<Layout />}>
              <Route index element={<SectionEdit />} />
              <Route path="quiz" element={<QuizList />} />
              <Route path="quiz/preview/:slug" element={<PreviewQuiz />} />
              <Route path="quiz/edit/:slug" element={<EditQuiz />} />
              <Route path="test" element={<TestList />} />
              <Route path="test/edit/:slug" element={<EditTest />} />
              <Route path="test/preview/:slug" element={<PreviewTest />} />
              <Route path="manage/users" element={<ManageUsers />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
