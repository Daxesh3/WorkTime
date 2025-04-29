import { FC } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/layout/Layout';
import EmployeeSchedule from './pages/EmployeeSchedule';
import Calculations from './pages/Calculations';
import NotFound from './pages/NotFound';
import Companies from './pages/Company/Companies';
import ParameterSettings from './pages/ParameterSettings';

const App: FC = () => {
    return (
        <Routes>
            <Route path='/' element={<Layout />}>
                <Route index element={<Navigate to='companies' replace />} />
                <Route path='companies' element={<Companies />} />
                <Route path='parameters' element={<ParameterSettings />} />
                <Route path='schedule' element={<EmployeeSchedule />} />
                <Route path='calculations' element={<Calculations />} />
                <Route path='*' element={<NotFound />} />
            </Route>
        </Routes>
    );
};

export default App;
