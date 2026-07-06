import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LoginPage from "./pages/LoginPage";
import ContactUs from "./pages/ContactUs";
import { Layout } from "./components/Layout";
import { navItems } from "./components/Sidebar";
import AddUserPage from "./pages/AddUserPage";
import { CookiesProvider } from "react-cookie";
import { SchemeContextProvider } from "./contexts/SchemeContext";
import UpdateUser from "./pages/UpdateUser";
import RedirectGuard from "./components/RedirectGuard";
import RegisterUser from "./pages/RegisterUser";
import UserRegristrationPage from "./pages/OrganizationRegristrationPage";
import UserRegristration from "./pages/UserRegristration";
import UserInstruction from "./pages/UserInstruction";
import ReceiptPage from "./pages/ReceiptPage";
import UserRegProtectedRoute from "./components/UserRegProtectedRoute";

function App() {
  return (
    <SchemeContextProvider>
      <CookiesProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterUser />} />

          <Route path="/receipt" element={<ReceiptPage />} />

          <Route element={<UserRegProtectedRoute isAllowed={true} />}>
            <Route
              path="/register-organization"
              element={<UserRegristrationPage />}
            />
            <Route path="/register-user" element={<UserRegristration />} />
            <Route path="/user-instruction" element={<UserInstruction />} />
          </Route>

          {/* Protected Layout Wrapper */}
          <Route
            element={
              <RedirectGuard>
                <Layout />
              </RedirectGuard>
            }
          >
            {/* Dynamic sidebar routes */}
            {navItems.map((item) => (
              <Route
                key={item.path}
                path={item.path.substring(1)}
                element={<item.component />}
              />
            ))}

            {/* Manual protected routes */}
            <Route
              path="contact-us"
              element={
                <RedirectGuard>
                  <ContactUs />
                </RedirectGuard>
              }
            />

            <Route
              path="addUser"
              element={
                <RedirectGuard requiredRole={1}>
                  <AddUserPage />
                </RedirectGuard>
              }
            />

            <Route
              path="updateUser"
              element={
                <RedirectGuard requiredRole={1}>
                  <UpdateUser />
                </RedirectGuard>
              }
            />
          </Route>
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />
      </CookiesProvider>
    </SchemeContextProvider>
  );
}

export default App;
