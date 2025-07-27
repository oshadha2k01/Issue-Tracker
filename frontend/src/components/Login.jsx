import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import Swal from "sweetalert2";
import { authAPI } from "../services/api";

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
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
        }
        break;
      case "password":
        if (!value) {
          error = "Password is required";
        } else if (value.length < 6) {
          error = "Password must be at least 6 characters";
        }
        break;
      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Input validations
    let filteredValue = value;

    switch (name) {
      case "username":
        // Allow letters, numbers, underscores, and @ symbol
        filteredValue = value.replace(/[^a-zA-Z0-9_@]/g, "");
        break;
      case "password":
        // Block most special characters, allow basic ones for password security
        filteredValue = value.replace(/[^a-zA-Z0-9!@#$%^&*]/g, "");
        break;
      default:
        break;
    }

    setFormData({
      ...formData,
      [name]: filteredValue,
    });

    // form validation
    if (touched[name]) {
      const error = validateField(name, filteredValue);
      setErrors({
        ...errors,
        [name]: error,
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

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    setTouched({ username: true, password: true });

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
        title: "Logging in...",
        text: "Please wait while we authenticate you.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await authAPI.login(formData);

      console.log("Login successful:", response);

      // Store token in localStorage
      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("username", response.username);

        console.log("Login - Stored in localStorage:", {
          token: response.token,
          username: response.username,
        });

        window.dispatchEvent(new CustomEvent("authChange"));
        console.log("Login - Dispatched authChange event"); // Debug line
      }

      Swal.fire({
        title: "Success!",
        text: `Welcome back, ${response.username}! Redirecting...`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Login error:", error);

      Swal.fire({
        title: "Login Failed!",
        text: error.message || "Invalid credentials. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#000080",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      Swal.fire({
        title: "Connecting to Google...",
        text: "Please wait while we open the Google sign-in window.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Sign in with Google using Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      console.log("Google sign-in successful:", user);

      // Get the Firebase ID token
      const idToken = await user.getIdToken();

      // Send the token to your backend for verification and user creation/login
      try {
        const response = await fetch('http://localhost:5000/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken,
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL,
          }),
        });

        if (!response.ok) {
          throw new Error('Backend authentication failed');
        }

        const data = await response.json();

        // Store the backend token in localStorage
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("username", data.username || user.displayName);

          console.log("Google Login - Stored in localStorage:", {
            token: data.token,
            username: data.username || user.displayName,
          });

          window.dispatchEvent(new CustomEvent("authChange"));
        }

        Swal.fire({
          title: "Success!",
          text: `Welcome, ${user.displayName}! Redirecting...`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        });

        setTimeout(() => {
          navigate("/");
        }, 2000);

      } catch (backendError) {
        console.error("Backend authentication error:", backendError);
        
        // If backend fails, you can still proceed with client-side auth
        // Store Firebase user data directly (for development/testing)
        localStorage.setItem("token", idToken);
        localStorage.setItem("username", user.displayName);
        window.dispatchEvent(new CustomEvent("authChange"));

        Swal.fire({
          title: "Success!",
          text: `Welcome, ${user.displayName}! Redirecting... (Using Firebase auth)`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        });

        setTimeout(() => {
          navigate("/");
        }, 2000);
      }

    } catch (error) {
      console.error("Google sign-in error:", error);
      
      let errorMessage = "Unable to sign in with Google. Please try again.";
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in was cancelled. Please try again.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Pop-up was blocked by your browser. Please allow pop-ups and try again.";
      }

      Swal.fire({
        title: "Sign-In Failed!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#000080",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="text-center py-6">
        <h4
          className="text-4xl font-semibold"
          style={{ color: "#000000", fontSize: "34px", fontWeight: "600" }}
        >
          Welcome
        </h4>
      </div>

      {/* Login Form */}
      <div className="flex justify-center px-4 mt-8">
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

              <button
                type="submit"
                className="w-full py-2 mt-6 font-semibold text-white bg-blue-900 hover:bg-blue-950 rounded-lg transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-lg"
                style={{ borderRadius: "5px" }}
              >
                Login
              </button>
            </form>

            <div className="flex items-center my-4">
              <hr className="flex-grow border-gray-300" />
              <span className="px-3 text-sm text-gray-500 bg-white">or</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-2 font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
              style={{ borderRadius: "5px" }}
            >
              <FcGoogle size={20} />
              Continue with Google
            </button>

            <div className="text-center mt-4">
              <small className="text-gray-500">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign up
                </Link>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
