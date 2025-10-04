import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Login } from './pages/auth/Login';
import { InstancesList } from './pages/instances/InstancesList';
import { InstanceDetail } from './pages/instances/InstanceDetail';
import { CourseDetail } from './pages/instances/CourseDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <InstancesList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/instances/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <InstanceDetail />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/instances/:id/courses/:courseId"
          element={
            <ProtectedRoute>
              <Layout>
                <CourseDetail />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
