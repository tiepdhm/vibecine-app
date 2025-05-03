import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignInScreen } from "./screens/SignInScreen";
import { SignUpScreen } from "./screens/SignUpScreen";
import { UserMovieDetailScreen } from "./screens/UserMovieDetailScreen";
import { AddNewMovie } from "./screens/AddNewMovie";
import { ViewAnalysis } from "./screens/ViewAnalysis";
import { AdminLoginScreen } from "./screens/AdminLoginScreen";
import { DataScientistLogin } from "./screens/DataScientistLogin";
import { SettingFunction } from "./screens/SettingFunction";
import { CookiesProvider } from 'react-cookie';
import ProtectedRoute from "./components/ProtectedRoute";
import { Unauthorized } from "./screens/Unauthorized";
import { ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById("app")).render(
  <StrictMode>
    <CookiesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<SignInScreen />} />
          <Route path="/register" element={<SignUpScreen />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/*Guest, User*/}
          <Route
          path="/user_home"
          element={
            <ProtectedRoute allowedRoles={['user', 'guest']}>
              <UserMovieDetailScreen />
            </ProtectedRoute>
          }
          />
          <Route
          path="/view_analysis/:movieId"
          element={
            <ProtectedRoute allowedRoles={['user', 'guest']}>
              <ViewAnalysis />
            </ProtectedRoute>
          }
          />

          {/*User*/}
          <Route
          path="/add_movie"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <AddNewMovie />
            </ProtectedRoute>
          }
          />

          {/* Admin */}
          <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLoginScreen />
            </ProtectedRoute>
          }
          />

          {/* Data Scientist */}
          <Route
          path="/model_training"
          element={
            <ProtectedRoute allowedRoles={['data_scientist']}>
              <DataScientistLogin />
            </ProtectedRoute>
          }
          />

          {/* Authorized roles */}
          <Route
          path="/setting"
          element={
            <ProtectedRoute allowedRoles={['user', 'admin', 'data_scientist']}>
              <SettingFunction />
            </ProtectedRoute>
          }
          />

          {/* Root */}
          <Route path="/" element={<SignInScreen />} />
          {/* Wildcard route */}
          <Route path="*" element={<Unauthorized />} />
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce}
          />
      </BrowserRouter>
    </CookiesProvider>
  </StrictMode>
);


