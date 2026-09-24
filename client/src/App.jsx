import { Routes, Route, useLocation } from 'react-router-dom';
import Splash from './pages/Splash';
import Welcome from './pages/auth/Welcome';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import VendorSignUp from './pages/auth/VendorSignUp';
import OtpVerification from './pages/auth/OtpVerification';
import ForgotPassword from './pages/auth/ForgotPassword';
import Home from './pages/Home';
import ListingDetail from './pages/ListingDetail';
import Messages from './pages/Messages';
import Chat from './pages/Chat';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import VendorRegistration from './pages/VendorRegistration';
import Profile from './pages/Profile';
import RatingsReviews from './pages/RatingsReviews';
import AdminDashboard from './pages/admin/AdminDashboard';
import MyListings from './pages/MyListings';
import SavedItems from './pages/SavedItems';
import AccountSettings from './pages/AccountSettings';
import HelpSupport from './pages/HelpSupport';
import Filters from './pages/Filters';
import Notifications from './pages/Notifications';
import DashboardLayout from './components/DashboardLayout';

export default function App() {
  const location = useLocation();
  const dashboard = (element) => <DashboardLayout>{element}</DashboardLayout>;

  return (
    <div key={location.pathname} className="animate-[pageFade_0.28s_ease-out]">
      <Routes location={location}>
        <Route path="/" element={<Splash />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/vendor-signup" element={<VendorSignUp />} />
        <Route path="/verify-otp" element={<OtpVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/home" element={<Home />} />
        <Route path="/listing/:id" element={dashboard(<ListingDetail />)} />
        <Route path="/listing/:id/edit" element={dashboard(<EditListing />)} />
        <Route path="/messages" element={dashboard(<Messages />)} />
        <Route path="/messages/:listingId" element={dashboard(<Chat />)} />
        <Route path="/messages/thread/:conversationId" element={dashboard(<Chat />)} />
        <Route path="/sell" element={dashboard(<CreateListing />)} />
        <Route path="/vendor-registration" element={dashboard(<VendorRegistration />)} />
        <Route path="/profile" element={dashboard(<Profile />)} />
        <Route path="/listing/:id/review" element={dashboard(<RatingsReviews />)} />
        <Route path="/admin" element={dashboard(<AdminDashboard />)} />
        <Route path="/my-listings" element={dashboard(<MyListings />)} />
        <Route path="/saved" element={dashboard(<SavedItems />)} />
        <Route path="/settings" element={dashboard(<AccountSettings />)} />
        <Route path="/support" element={dashboard(<HelpSupport />)} />
        <Route path="/filters" element={dashboard(<Filters />)} />
        <Route path="/notifications" element={dashboard(<Notifications />)} />
      </Routes>
    </div>
  );
}
