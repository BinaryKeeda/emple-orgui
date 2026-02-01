// App.tsx
import React, { Suspense, useEffect } from 'react'
import Layout from './Layout/Layout'
import { useDispatch, useSelector } from 'react-redux'
import { type RootState, type AppDispatch } from './store/store'
import { fetchProfile } from './store/thunks/userThunks'
import { RoleBasedRoute, UserRoute } from './auth/ProtectedRoute'
import Loader from './Layout/Loader'
import QuestionBank from './pages/QuestionBank'
import ExamList from './pages/ExamList'
import ExamEdit from './pages/ExamEdit'
import AddProblem from './pages/AddProblem'
import ProblemList from './pages/ProblemList'
import ExamPreview from './pages/ExamPreview'
import UserTestPreview from './pages/UserTestPreview'
import { useUser } from './context/UserContext'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

// Pages (lazy imports)
const Login = React.lazy(() => import('./pages/Login'))
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'))
const SuperAdminDashboard = React.lazy(() => import('./pages/SuperAdminDashboard'))
const SectionEdit = React.lazy(() => import('./pages/SectionEdit'))
const QuizList = React.lazy(() => import('./pages/QuizList'))
const TestList = React.lazy(() => import('./pages/TestList'))
const ManageUsers = React.lazy(() => import('./pages/ManageUsers'))
const QuestionBankEdit = React.lazy(() => import('./pages/QuestionBankEdit'));
// Editor + Preview
const EditQuiz = React.lazy(() => import('./pages/QuizEdit'));
const EditTest = React.lazy(() => import('./pages/TestEdit'))
const PreviewQuiz = React.lazy(() => import('./pages/QuizPreview'))
const PreviewTest = React.lazy(() => import('./pages/TestPreview'))

const App: React.FC = () => {

  const { user, isFetchingUser } = useUser();

  if (isFetchingUser) return <Loader />

  return (
    <Suspense fallback={<Loader />}>
      <BrowserRouter basename="/campus-admin">
        <Routes>
          {/* Public Route */}
          {/* <Route path="/" element={<UserRoute />} /> */}
          {/* <Route index element={<Login />} /> */}
          {/* </Route> */}

          {/* Dashboard (Superadmin OR Admin) */}
          <Route
            path="/"
            element={
              <RoleBasedRoute requiredRole={['campus-superadmin', 'campus-admin']} />
            }
          >
            <Route
              index
              element={
                user?.role === 'campus-admin'
                  ? <AdminDashboard />
                  : <SuperAdminDashboard />
              }
            />
          </Route>

          {/* Section routes (Admin + Superadmin) */}
          <Route
            element={
              <RoleBasedRoute requiredRole={['campus-admin', 'campus-superadmin']} />
            }
          >
            <Route path="/section/:id" element={<Layout />}>
              <Route index element={<SectionEdit />} />
              <Route path="quiz" element={<QuizList />} />
              <Route path="quiz/preview/:slug" element={<PreviewQuiz />} />
              <Route path="quiz/edit/:slug" element={<EditQuiz />} />
              <Route path="test" element={<TestList />} />
              <Route path="test/edit/:slug" element={<EditTest />} />
              <Route path="test/preview/:slug" element={<PreviewTest />} />
              <Route path="manage/users" element={<ManageUsers />} />
              <Route path='exam' element={<ExamList />} />
              <Route path='exam/edit/:slug' element={<ExamEdit />} />
              <Route path='exam/preview/:slug' element={<ExamPreview />} />
              <Route path='exam/preview/:slug/:attemptId' element={<UserTestPreview />} />
              <Route path='questionbank' element={<QuestionBank />} />
              <Route path='questionbank/edit/:slug' element={<QuestionBankEdit />} />
              <Route path='add-problem/:problemId' element={<AddProblem />} />
              <Route path='add-problem/' element={<ProblemList />} />
              <Route path='users' element={<ManageUsers />} />
              <Route path='*' element={<>Not Found</>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </Suspense>
  )
}

export default App
