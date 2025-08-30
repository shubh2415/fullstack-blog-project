import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import GuestLogin from './pages/GuestLogin.jsx';
import Home from './pages/Home.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import SingleBlog from './pages/SingleBlog.jsx';
import AddBlog from './pages/AddBlog.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import UpdateBlog from './pages/UpdateBlog.jsx';
import MyPosts from './pages/MyPosts.jsx';
import Profile from './pages/Profile.jsx';
// --- NEW: Import the new component ---
import ViewPendingBlog from './pages/ViewPendingBlog.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/guest-login" element={<GuestLogin />} />
      <Route path="/home" element={<Home />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/blog/:blogId" element={<SingleBlog />} />
      
      {/* Routes for Guest Author */}
      <Route path="/add-blog" element={<AddBlog />} />
      <Route path="/my-posts" element={<MyPosts />} />
      
      {/* Routes for Admin */}
      <Route path="/admin/create-blog" element={<AddBlog isAdmin={true} />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/update-blog/:blogId" element={<UpdateBlog />} />
      {/* --- NEW: Route for viewing a pending blog --- */}
      <Route path="/admin/view-pending/:pendingId" element={<ViewPendingBlog />} />
      
    </Routes>
  );
}

export default App;