import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Layout from './components/layout/Layout'
import ParameterSettings from './pages/ParameterSettings'
import EmployeeSchedule from './pages/EmployeeSchedule'
import Calculations from './pages/Calculations'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/parameters" replace />} />
        <Route path="parameters" element={<ParameterSettings />} />
        <Route path="schedule" element={<EmployeeSchedule />} />
        <Route path="calculations" element={<Calculations />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App