import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LoginPage from "./pages/LoginPage";
import ContactUs from "./pages/ContactUs";
import { Layout } from "./components/Layout";
import { navItems } from "./components/Sidebar";
import AddUserPage from "./pages/AddUserPage";
import MerchantOnboarding from "./pages/MerchantOnboarding";
import MerchantOnboardingDetails from "./pages/MerchantOnboardingDetails";
import MerchantKycPage from "./pages/MerchantKycPage";
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
import commissions from "./pages/commissions";

import { ServicePage } from "./pages/ServicePage";
import Vendorpayment from "./pages/Vendorpayment";
import VendorVerification from "./pages/VendorVerification";
import QRServices from "./pages/QRServices";
import MerchantPayment from "./pages/MerchantPayment";

import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <SchemeContextProvider>
        <CookiesProvider>
          <Routes>
            {/* Public Route */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterUser />} />

            <Route path="/receipt" element={<ReceiptPage />} />

            <Route path="/pay/:slug" element={<MerchantPayment />} />

            {/* <Route
              path="/beneficiary-verification/:token"
              element={<VendorVerification />}
            /> */}

            <Route
              path="/beneficiary-verification"
              element={<VendorVerification />}
            />

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
              {/* {navItems.map((item) => (
                <Route
                  key={item.path}
                  path={item.path.substring(1)}
                  element={<item.component />}
                />
              ))} */}

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

              {navItems.map((item) => {
                if (item.children) {
                  return item.children.map((child) => {
                    if (!child.path || !child.component) {
                      console.warn("Invalid child nav item:", child);
                      return null;
                    }

                    const Component = child.component;

                    return (
                      <Route
                        key={child.path}
                        path={child.path.substring(1)}
                        element={<Component />}
                      />
                    );
                  });
                }

                if (!item.path || !item.component) {
                  console.warn("Invalid nav item:", item);
                  return null;
                }

                const Component = item.component;

                return (
                  <Route
                    key={item.path}
                    path={item.path.substring(1)}
                    element={<Component />}
                  />
                );
              })}

              <Route
                path="/merchant-onboarding/:id"
                element={<MerchantOnboardingDetails />}
              />

              <Route
                path="updateUser"
                element={
                  <RedirectGuard requiredRole={1}>
                    <UpdateUser />
                  </RedirectGuard>
                }
              />

              <Route path="services" element={<ServicePage />} />
              <Route path="/vendor-payment" element={<Vendorpayment />} />
              <Route path="/qr-services" element={<QRServices />} />
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
    </>
  );
}

export default App;
