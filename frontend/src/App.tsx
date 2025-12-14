import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Layout } from 'antd'
import AppRouter from './router/AppRouter'
import ErrorBoundary from './components/common/ErrorBoundary'
import './App.css'

const { Content } = Layout

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Layout className="app-layout">
          <Content>
            <AppRouter />
          </Content>
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App