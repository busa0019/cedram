import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import MainLayout from "./layout/MainLayout";
import AdminLayout from "./layout/AdminLayout";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ResearchList from "./pages/ResearchList";
import ResearchArticle from "./pages/ResearchArticle";
import DisasterMap from "./pages/DisasterMap";
import SubmitReport from "./pages/SubmitReport";
import DisasterInsights from "./pages/DisasterInsights";
import AuditLogs from "./pages/AuditLogs";
import DataPolicy from "./pages/DataPolicy";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Disclaimer from "./pages/Disclaimer";
import IncidentDetails from "./pages/IncidentDetails";
import Support from "./pages/Support";

import Programs from "./pages/Programs";
import Training from "./pages/Training";

import ScrollToTop from "./components/ScrollToTop";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import CreateArticle from "./pages/CreateArticle";
import CreateIncident from "./pages/CreateIncident";
import AdminIncidents from "./pages/AdminIncidents";
import EditIncident from "./pages/EditIncident";
import AdminFieldReports from "./pages/AdminFieldReports";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminProfile from "./pages/AdminProfile";
import AdminUsers from "./pages/AdminUsers";
import CreateUser from "./pages/CreateUser";
import AdminActivity from "./pages/AdminActivity";
import AdminPublications from "./pages/AdminPublications";
import AdminArchivedIncidents from "./pages/AdminArchivedIncidents";
import EditArticle from "./pages/EditArticle";
import IncidentHistory from "./pages/IncidentHistory";

import AdminTrainings from "./pages/AdminTrainings";
import CreateTraining from "./pages/CreateTraining";
import EditTraining from "./pages/EditTraining";


import PrivateRoute from "./components/PrivateRoute";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

function Page({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="pt-20"
    >
      {children}
    </motion.div>
  );
}

function App() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* PUBLIC ROUTES */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Page><Home /></Page>} />
            <Route path="/about" element={<Page><About /></Page>} />

            <Route path="/programs" element={<Page><Programs /></Page>} />
            <Route path="/training" element={<Page><Training /></Page>} />
            <Route path="/contact" element={<Page><Contact /></Page>} />

          <Route path="/research" element={<Page><ResearchList /></Page>} />
          <Route path="/research/:slug" element={<Page><ResearchArticle /></Page>} />

          <Route path="/disaster-map" element={<Page><DisasterMap /></Page>} />
          <Route path="/submit-report" element={<Page><SubmitReport /></Page>} />
          <Route path="/insights" element={<Page><DisasterInsights /></Page>} />
          <Route path="/incidents/:id" element={<Page><IncidentDetails /></Page>} />
          <Route path="/support" element={<Page><Support /></Page>} />

          <Route path="/data-policy" element={<Page><DataPolicy /></Page>} />
          <Route path="/privacy" element={<Page><Privacy /></Page>} />
          <Route path="/terms" element={<Page><Terms /></Page>} />
          <Route path="/disclaimer" element={<Page><Disclaimer /></Page>} />
        </Route>

        {/* ADMIN LOGIN */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ADMIN PROTECTED */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route
            path="dashboard"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="create-article"
            element={
              <PrivateRoute>
                <CreateArticle />
              </PrivateRoute>
            }
          />

          <Route
            path="publications"
            element={
              <PrivateRoute>
                <AdminPublications />
              </PrivateRoute>
            }
          />

          <Route
            path="edit-article/:id"
            element={
              <PrivateRoute>
                <EditArticle />
              </PrivateRoute>
            }
          />

          <Route
            path="create-incident"
            element={
              <PrivateRoute>
                <CreateIncident />
              </PrivateRoute>
            }
          />

          <Route
            path="incidents"
            element={
              <PrivateRoute>
                <AdminIncidents />
              </PrivateRoute>
            }
          />

          <Route
            path="incidents/:id/history"
            element={
              <PrivateRoute>
                <IncidentHistory />
              </PrivateRoute>
            }
          />

          <Route
            path="edit-incident/:id"
            element={
              <PrivateRoute>
                <EditIncident />
              </PrivateRoute>
            }
          />

          <Route
            path="trainings"
            element={
              <PrivateRoute>
                <AdminTrainings />
              </PrivateRoute>
            }
          />

          <Route
            path="create-training"
            element={
              <PrivateRoute>
                <CreateTraining />
              </PrivateRoute>
            }
          />

          <Route
            path="edit-training/:id"
            element={
              <PrivateRoute>
                <EditTraining />
              </PrivateRoute>
            }
          />

          <Route
            path="field-reports"
            element={
              <PrivateRoute>
                <AdminFieldReports />
              </PrivateRoute>
            }
          />

          <Route
            path="analytics"
            element={
              <PrivateRoute>
                <AdminAnalytics />
              </PrivateRoute>
            }
          />

          <Route
            path="audit-logs"
            element={
              <PrivateRoute>
                <AuditLogs />
              </PrivateRoute>
            }
          />

          <Route
            path="activity"
            element={
              <PrivateRoute>
                <AdminActivity />
              </PrivateRoute>
            }
          />

          <Route
            path="users"
            element={
              <PrivateRoute>
                <AdminUsers />
              </PrivateRoute>
            }
          />

          <Route
            path="create-user"
            element={
              <PrivateRoute>
                <CreateUser />
              </PrivateRoute>
            }
          />

          <Route
            path="archived-incidents"
            element={
              <PrivateRoute>
                <AdminArchivedIncidents />
              </PrivateRoute>
            }
          />

          <Route
            path="profile"
            element={
              <PrivateRoute>
                <AdminProfile />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </AnimatePresence>
    </>
  );
}

export default App;