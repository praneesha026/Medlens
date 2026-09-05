import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PatientProvider } from './context/PatientContext';
import { MainLayout } from './layouts/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { PatientIntakePage } from './pages/PatientIntakePage';
import { ReportUploadPage } from './pages/ReportUploadPage';
import { PatientDashboardPage } from './pages/PatientDashboardPage';
import { ReportDetailsPage } from './pages/ReportDetailsPage';

export default function App() {
  return (
    <PatientProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="patient-intake" element={<PatientIntakePage />} />
            <Route path="upload" element={<ReportUploadPage />} />
            <Route path="dashboard" element={<PatientDashboardPage />} />
            <Route path="report-details" element={<ReportDetailsPage />} />
            <Route path="reports" element={<ReportDetailsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </PatientProvider>
  );
}
