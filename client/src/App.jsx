import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import ApplyJob from './pages/ApplyJob';
import SavedJobs from './pages/SavedJobs';
import MyApplications from './pages/MyApplications';
import JobseekerDashboard from './pages/JobseekerDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import Profile from './pages/Profile';
import MyJobs from './pages/MyJobs';
import CreateJob from './pages/CreateJob';
import EditJob from './pages/EditJob';
import Applicants from './pages/Applicants';
import NotFound from './pages/NotFound';
import { useAuth } from './context/AuthContext';

function App() {
    const { isAuthenticated, user } = useAuth();

    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route
                    path="/login"
                    element={isAuthenticated
                        ? <Navigate to={user?.role === 'recruiter' ? '/dashboard/recruiter' : '/dashboard/jobseeker'} replace />
                        : <Login />}
                />
                <Route
                    path="/register"
                    element={isAuthenticated
                        ? <Navigate to={user?.role === 'recruiter' ? '/dashboard/recruiter' : '/dashboard/jobseeker'} replace />
                        : <Register />}
                />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:id" element={<JobDetails />} />
                <Route
                    path="/jobs/:id/apply"
                    element={(
                        <ProtectedRoute role="jobseeker">
                            <ApplyJob />
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path="/saved-jobs"
                    element={(
                        <ProtectedRoute role="jobseeker">
                            <SavedJobs />
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path="/my-applications"
                    element={(
                        <ProtectedRoute role="jobseeker">
                            <MyApplications />
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path="/dashboard/jobseeker"
                    element={(
                        <ProtectedRoute role="jobseeker">
                            <JobseekerDashboard />
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path="/dashboard/recruiter"
                    element={(
                        <ProtectedRoute role="recruiter">
                            <RecruiterDashboard />
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path="/profile"
                    element={(
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path="/my-jobs"
                    element={(
                        <ProtectedRoute role="recruiter">
                            <MyJobs />
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path="/create-job"
                    element={(
                        <ProtectedRoute role="recruiter">
                            <CreateJob />
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path="/edit-job/:id"
                    element={(
                        <ProtectedRoute role="recruiter">
                            <EditJob />
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path="/jobs/:jobId/applicants"
                    element={(
                        <ProtectedRoute role="recruiter">
                            <Applicants />
                        </ProtectedRoute>
                    )}
                />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}

export default App;
