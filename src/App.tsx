import { FC } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/layout/Layout";
import Employee from "./pages/Employee/Employee";
import EmployeeDetails from "./pages/Calculation/EmployeeDetails";
import NotFound from "./pages/NotFound";
import Companies from "./pages/Company/Companies";
import ParameterSettings from "./pages/ParameterSettings";
import CompanyDetails from "./pages/Company/CompanyDetails";
import Calculations from "./pages/Calculations";
import StampTypes from "./pages/StampTypes/StampTypes";
import EmployeeRecordsPage from "./pages/Employee/EmployeeRecordsPage";

const App: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="companies" replace />} />
        <Route path="companies" element={<Companies />} />
        <Route path="companies/:companyId" element={<CompanyDetails />} />
        <Route path="parameters" element={<ParameterSettings />} />
        <Route path="employee" element={<Employee />} />
        <Route path="calculations/:userId" element={<EmployeeDetails />} />
        <Route path="calculations" element={<Calculations />} />
        <Route path="/stamp-types" element={<StampTypes />} />
        <Route
          path="/companies/:companyId/stamp-types"
          element={<StampTypes />}
        />
        <Route
          path="/companies/:companyId/employee-records"
          element={<EmployeeRecordsPage />}
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
