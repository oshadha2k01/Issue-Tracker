import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiEdit3,
  FiTrash2,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { auth } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsGoogleUser(true);
        setUserProfile({
          username: user.displayName || "Google User",
          email: user.email,
          googleId: user.uid,
        });
        setFormData({
          username: user.displayName || "Google User",
          email: user.email,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      if (token.length > 500) {
        setIsGoogleUser(true);
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUserProfile(response.data);
        setIsGoogleUser(false);
        setFormData({
          username: response.data.username,
          email: response.data.email,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (backendError) {
        console.log("Backend profile fetch failed, checking for Google user");
        const username = localStorage.getItem("username");
        if (username) {
          setIsGoogleUser(true);
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/login");
      } else {
        Swal.fire("Error", "Failed to load profile", "error");
      }
    }
  };

  const validateField = (name, value) => {
    let error = "";
    if (name === "username") {
      if (!value.trim()) error = "Username is required";
      else if (value.length < 3)
        error = "Username must be at least 3 characters";
    }
    if (name === "email") {
      if (!value.trim()) error = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(value)) error = "Email is invalid";
    }
    if (name === "currentPassword") {
      if (!value.trim()) error = "Current password is required";
    }
    if (name === "newPassword") {
      if (value && value.length < 6)
        error = "New password must be at least 6 characters";
    }
    if (name === "confirmPassword") {
      if (value !== formData.newPassword) error = "Passwords do not match";
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (isGoogleUser) {
      Swal.fire({
        title: "Google Account",
        text: "Profile editing is not available for Google accounts. Please manage your profile through your Google account settings.",
        icon: "info",
        confirmButtonText: "OK",
        confirmButtonColor: "#000080",
      });
      setShowModal(false);
      return;
    }

    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      if (field === "newPassword" && !formData.newPassword) return;
      if (field === "confirmPassword" && !formData.newPassword) return;
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    setTouched({
      username: true,
      email: true,
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    });

    if (Object.keys(newErrors).length > 0) {
      Swal.fire({
        title: "Validation Error!",
        text: "Please fix the errors before submitting.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#000080",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const updateData = {
        username: formData.username,
        email: formData.email,
        currentPassword: formData.currentPassword,
      };

      if (formData.newPassword) {
        updateData.newPassword = formData.newPassword;
      }

      await axios.put("http://localhost:5000/api/auth/profile", updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.setItem("username", formData.username);
      window.dispatchEvent(new CustomEvent("authChange"));

      Swal.fire({
        title: "Success!",
        text: "Profile updated successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      setShowModal(false);
      fetchUserProfile();
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to update profile",
        "error"
      );
    }
  };

  const handleDeleteProfile = async () => {
    const result = await Swal.fire({
      title: "Delete Account",
      text: isGoogleUser
        ? "This will sign you out of your Google account. Your Google account itself will not be deleted."
        : "Are you sure you want to delete your account? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: isGoogleUser
        ? "Yes, sign out"
        : "Yes, delete my account",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        if (isGoogleUser) {
          await signOut(auth);
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          window.dispatchEvent(new CustomEvent("authChange"));

          Swal.fire({
            title: "Signed Out!",
            text: "You have been successfully signed out from your Google account.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          const token = localStorage.getItem("token");
          await axios.delete("http://localhost:5000/api/auth/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });

          localStorage.removeItem("token");
          localStorage.removeItem("username");
          window.dispatchEvent(new CustomEvent("authChange"));

          Swal.fire({
            title: "Account Deleted!",
            text: "Your account has been successfully deleted.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        }

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (error) {
        Swal.fire(
          "Error",
          error.response?.data?.message || "Failed to process request",
          "error"
        );
      }
    }
  };

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-semibold text-gray-600">
                    Username
                  </label>
                  <p className="text-gray-900 font-medium">
                    {userProfile.username}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-semibold text-gray-600">
                    Email
                  </label>
                  <p className="text-gray-900 font-medium">
                    {userProfile.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex md:flex-col gap-4 justify-center md:justify-start">
              <button
                onClick={() => setShowModal(true)}
                className={`${
                  isGoogleUser
                    ? "text-gray-400 border-gray-300 cursor-not-allowed"
                    : "text-yellow-600 border-yellow-600 hover:bg-yellow-100"
                } border flex items-center justify-center p-3 rounded-lg shadow-sm transition-colors`}
                style={{ borderRadius: "5px" }}
                disabled={isGoogleUser}
                title={
                  isGoogleUser
                    ? "Google accounts cannot be edited here"
                    : "Edit profile"
                }
              >
                <FiEdit3 size={18} />
              </button>

              <button
                onClick={handleDeleteProfile}
                className="text-red-600 border border-red-600 hover:bg-red-100 flex items-center justify-center p-3 rounded-lg shadow-sm transition-colors"
                style={{ borderRadius: "5px" }}
                title={
                  isGoogleUser
                    ? "Sign out from Google account"
                    : "Delete account"
                }
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <motion.div
              className="modal-content border-0 shadow-lg rounded-3 overflow-hidden bg-white"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="position-relative py-4 px-4">
                <div className="d-flex justify-content-center align-items-center position-relative">
                  <div className="text-center">
                    <h5
                      className="modal-title text-dark mb-0 fw-bold"
                      style={{ fontSize: "24px" }}
                    >
                      Edit Profile
                    </h5>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-close position-absolute end-0"
                    aria-label="Close"
                  ></button>
                </div>
              </div>

              <div className="modal-body py-4 px-4">
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`form-control ${
                        errors.username
                          ? "is-invalid"
                          : touched.username && !errors.username
                          ? "is-valid"
                          : ""
                      }`}
                      style={{ height: "40px", fontSize: "16px" }}
                    />
                    {errors.username && (
                      <div className="invalid-feedback">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.username}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`form-control ${
                        errors.email
                          ? "is-invalid"
                          : touched.email && !errors.email
                          ? "is-valid"
                          : ""
                      }`}
                      style={{ height: "40px", fontSize: "16px" }}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.email}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">
                      Current Password
                    </label>
                    <div className="position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`form-control pe-5 ${
                          errors.currentPassword
                            ? "is-invalid"
                            : touched.currentPassword && !errors.currentPassword
                            ? "is-valid"
                            : ""
                        }`}
                        style={{ height: "40px", fontSize: "16px" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="btn position-absolute end-0 top-50 translate-middle-y border-0 bg-transparent text-muted"
                        style={{ zIndex: 5 }}
                      >
                        {showPassword ? (
                          <FiEyeOff size={18} />
                        ) : (
                          <FiEye size={18} />
                        )}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <div className="invalid-feedback d-block">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.currentPassword}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">
                      New Password (optional)
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`form-control ${
                        errors.newPassword
                          ? "is-invalid"
                          : touched.newPassword && !errors.newPassword
                          ? "is-valid"
                          : ""
                      }`}
                      style={{ height: "40px", fontSize: "16px" }}
                      placeholder="New password"
                    />
                    {errors.newPassword && (
                      <div className="invalid-feedback">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.newPassword}
                      </div>
                    )}
                  </div>

                  {formData.newPassword && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`form-control ${
                          errors.confirmPassword
                            ? "is-invalid"
                            : touched.confirmPassword && !errors.confirmPassword
                            ? "is-valid"
                            : ""
                        }`}
                        style={{ height: "40px", fontSize: "16px" }}
                      />
                      {errors.confirmPassword && (
                        <div className="invalid-feedback">
                          <i className="fas fa-exclamation-circle me-1"></i>
                          {errors.confirmPassword}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="col-span-12 mt-6 pt-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-6 py-2 text-gray-600 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 sm:order-2"
                        style={{ height: "44px", borderRadius: "5px" }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 text-white bg-blue-900 hover:bg-blue-950 rounded-lg font-semibold transition-all duration-200 transform hover:-translate-y-1 shadow-md hover:shadow-lg sm:order-1"
                        style={{
                          height: "44px",
                          backgroundColor: "#1e3a8a",
                          borderRadius: "5px",
                        }}
                      >
                        Update Profile
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
