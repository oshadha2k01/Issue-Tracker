import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiChevronDown, FiUser, FiLogOut } from "react-icons/fi";
import Swal from "sweetalert2";

export default function NavBar() {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");

      if (token && username) {
        setUser({ username, token });
      } else {
        setUser(null);
      }
    };

    checkAuth();

    const handleAuthChange = () => checkAuth();
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setShowDropdown(false);
      }
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("authChange", handleAuthChange);
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("authChange", handleAuthChange);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Logout Confirmation",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#000080",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setUser(null);
        window.dispatchEvent(new CustomEvent("authChange"));

        Swal.fire({
          title: "Logged Out!",
          text: "You have been successfully logged out. Redirecting to login...",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        });

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    });
  };
  return (
    <nav className="fixed top-0 w-full bg-blue-900 z-50 px-8 py-2">
      <div className="flex justify-between items-center">
        <Link
          className="text-white font-bold text-decoration-none"
          to="/"
          style={{ fontSize: "28px" }}
        >
          Issue Tracker
        </Link>

        <div className="flex items-center">
          {user ? (
            <div className="relative dropdown-container">
              <button
                className="flex items-center gap-2 text-white font-semibold text-16 bg-transparent border-0 px-3 py-2 rounded hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                Hi, {user.username}
                <FiChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    showDropdown ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 bg-white rounded shadow-lg border min-w-40 z-50">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 text-14 hover:bg-gray-100 transition-colors text-decoration-none"
                    onClick={() => setShowDropdown(false)}
                  >
                    Profile
                  </Link>
                  <hr className="my-1" />
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 border-0 bg-transparent text-gray-700 text-14 hover:bg-gray-100 transition-colors text-decoration-none"
                    onClick={() => {
                      setShowDropdown(false);
                      handleLogout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              className="text-white font-semibold text-16 hover:text-gray-300 transition-colors text-decoration-none"
              to="/login"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
