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

export default function App() {
  const location = useLocation();

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
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/listing/:id/edit" element={<EditListing />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:listingId" element={<Chat />} />
        <Route path="/messages/thread/:conversationId" element={<Chat />} />
        <Route path="/sell" element={<CreateListing />} />
        <Route path="/vendor-registration" element={<VendorRegistration />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/listing/:id/review" element={<RatingsReviews />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/saved" element={<SavedItems />} />
        <Route path="/settings" element={<AccountSettings />} />
        <Route path="/support" element={<HelpSupport />} />
        <Route path="/filters" element={<Filters />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </div>
  );
}