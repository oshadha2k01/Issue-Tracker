import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { authAPI } from "../services/api";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const navigate = useNavigate();

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "username":
        if (!value.trim()) {
          error = "Username is required";
        } else if (value.length < 3) {
          error = "Username must be at least 3 characters";
        } else if (!/^[a-zA-Z0-9_@]+$/.test(value)) {
          error =
            "Username can only contain letters, numbers, underscores, and @ symbol";
        }
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          error = "Email is required";
        } else if (!emailRegex.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "password":
        if (!value) {
          error = "Password is required";
        } else if (value.length < 6) {
          error = "Password must be at least 6 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error =
            "Password must contain at least one uppercase letter, one lowercase letter, and one number";
        }
        break;
      case "confirmPassword":
        if (!value) {
          error = "Please confirm your password";
        } else if (value !== formData.password) {
          error = "Passwords do not match";
        }
        break;
      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let filteredValue = value;

    switch (name) {
      case "username":
        filteredValue = value.replace(/[^a-zA-Z0-9_@]/g, "");
        break;
      case "email":
        filteredValue = value.replace(/[^a-zA-Z0-9@.\-_]/g, "");
        break;
      case "password":
      case "confirmPassword":
        filteredValue = value.replace(/[^a-zA-Z0-9!@#$%^&*]/g, "");
        break;
      default:
        break;
    }

    setFormData({
      ...formData,
      [name]: filteredValue,
    });

    //Validation
    if (touched[name]) {
      const error = validateField(name, filteredValue);
      setErrors({
        ...errors,
        [name]: error,
      });
    }

    if (name === "password" && touched.confirmPassword) {
      const confirmError =
        formData.confirmPassword !== filteredValue
          ? "Passwords do not match"
          : "";
      setErrors({
        ...errors,
        [name]: validateField(name, filteredValue),
        confirmPassword: confirmError,
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });

    const error = validateField(name, value);
    setErrors({
      ...errors,
      [name]: error,
    });
  };

  //Block special characters validations
  const handleKeyPress = (e, fieldType) => {
    const char = e.key;

    switch (fieldType) {
      case "username":
        // Allow letters, numbers, underscores, @ symbol, and control keys
        if (
          !/[a-zA-Z0-9_@]/.test(char) &&
          !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(
            char
          )
        ) {
          e.preventDefault();
        }
        break;
      case "email":
        // Allow letters, numbers, @, ., -, _, and control keys
        if (
          !/[a-zA-Z0-9@.\-_]/.test(char) &&
          !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(
            char
          )
        ) {
          e.preventDefault();
        }
        break;
      case "password":
        // Allow letters, numbers, basic special characters, and control keys
        if (
          !/[a-zA-Z0-9!@#$%^&*]/.test(char) &&
          !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(
            char
          )
        ) {
          e.preventDefault();
        }
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validattions
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    setTouched({
      username: true,
      email: true,
      password: true,
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
      Swal.fire({
        title: "Creating Account...",
        text: "Please wait while we create your account.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      // Call backend API
      const response = await authAPI.register(registrationData);

      console.log("Registration successful:", response);

      Swal.fire({
        title: "Success!",
        text: "Account created successfully! Redirecting to login...",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);

      Swal.fire({
        title: "Registration Failed!",
        text:
          error.message ||
          "An error occurred during registration. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#000080",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="text-center py-2">
        <h4
          className="text-4xl font-semibold"
          style={{ color: "#000000", fontSize: "32px", fontWeight: "600" }}
        >
          Create an Account
        </h4>
      </div>

      {/* Register Form */}
      <div className="flex justify-center px-4 mt-2">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Username
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-300 h-10 ${
                    errors.username
                      ? "border-red-500 focus:ring-red-200"
                      : touched.username && !errors.username
                      ? "border-green-500 focus:ring-green-200"
                      : "border-gray-300 focus:ring-blue-200"
                  } focus:outline-none focus:ring-2 focus:border-blue-500`}
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={(e) => handleKeyPress(e, "username")}
                  placeholder="Enter your username"
                  maxLength="20"
                />
                {errors.username && (
                  <div className="text-red-500 text-sm mt-1">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {errors.username}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-300 h-10 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-200"
                      : touched.email && !errors.email
                      ? "border-green-500 focus:ring-green-200"
                      : "border-gray-300 focus:ring-blue-200"
                  } focus:outline-none focus:ring-2 focus:border-blue-500`}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={(e) => handleKeyPress(e, "email")}
                  placeholder="Enter your email"
                  maxLength="50"
                />
                {errors.email && (
                  <div className="text-red-500 text-sm mt-1">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {errors.email}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-300 h-10 ${
                    errors.password
                      ? "border-red-500 focus:ring-red-200"
                      : touched.password && !errors.password
                      ? "border-green-500 focus:ring-green-200"
                      : "border-gray-300 focus:ring-blue-200"
                  } focus:outline-none focus:ring-2 focus:border-blue-500`}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={(e) => handleKeyPress(e, "password")}
                  placeholder="Enter your password"
                  maxLength="30"
                />
                {errors.password && (
                  <div className="text-red-500 text-sm mt-1">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {errors.password}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-300 h-10 ${
                    errors.confirmPassword
                      ? "border-red-500 focus:ring-red-200"
                      : touched.confirmPassword && !errors.confirmPassword
                      ? "border-green-500 focus:ring-green-200"
                      : "border-gray-300 focus:ring-blue-200"
                  } focus:outline-none focus:ring-2 focus:border-blue-500`}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={(e) => handleKeyPress(e, "password")}
                  placeholder="Confirm your password"
                  maxLength="30"
                />
                {errors.confirmPassword && (
                  <div className="text-red-500 text-sm mt-1">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2 mt-6 font-semibold text-white bg-blue-900 hover:bg-blue-950 rounded-lg transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-lg"
                style={{ borderRadius: "5px" }}
              >
                Create Account
              </button>
            </form>

            <div className="text-center mt-4">
              <small className="text-gray-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign in
                </Link>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
