import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import HomePage from '../pages/HomePage'
import ArticleListPage from '../pages/ArticleListPage'
import ArticleEditorPage from '../pages/ArticleEditorPage'
import ArticleDetailPage from '../pages/ArticleDetailPage'
import ImageManagePage from '../pages/ImageManagePage'
import NotFoundPage from '../pages/NotFoundPage'

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="articles" element={<ArticleListPage />} />
        <Route path="articles/:id" element={<ArticleDetailPage />} />
        <Route path="editor" element={<ArticleEditorPage />} />
        <Route path="editor/:id" element={<ArticleEditorPage />} />
        <Route path="images" element={<ImageManagePage />} />
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  )
}

export default AppRouter