import { useState, useEffect, useRef } from "react";
import { useAddUserMutation } from "../api/userApiSlice";
import { useGetAllRolesQuery } from "../api/roleApiSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLogout } from "../auth/authSlice";

const SubUserFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  showNotification,
  formData,
  setFormData,
  closeModelWithoutSave,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const modalRef = useRef();

  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    data,
    isLoading: isRolesLoading,
    error: rolesError,
  } = useGetAllRolesQuery();
  const [addUser] = useAddUserMutation();
  const roles = (data || []).filter((role) => role.roleName !== "admin");

  const validatePhoneNumber = (phoneNo) => {
    // No validation, just return true or false based on if it's empty
    return phoneNo?.trim() !== ""; // Returns true if not empty
};

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex?.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    // Trim the input values
    const trimmedData = {
      userName: formData?.userName.trim(),
      phoneNo: formData?.phoneNo.trim(),
      email: formData?.email.trim(),
      userId: formData?.userId.trim(),
      password: formData?.password.trim(),
      userRole: formData?.userRole.trim(),
    };

    // Validate all fields
    if (!trimmedData?.userName) errors.userName = "Full Name is required.";
    if (!trimmedData?.phoneNo) errors.phoneNo = "Phone Number is required.";
    if (!trimmedData?.email) errors.email = "Email is required.";
    if (!trimmedData?.userId) errors.userId = "User ID is required.";
    if (!trimmedData?.password) errors.password = "Password is required.";
    if (!trimmedData?.userRole) errors.userRole = "User Role is required.";

    // Validate phone number
    if (trimmedData?.phoneNo && !validatePhoneNumber(trimmedData.phoneNo)) {
      errors.phoneNo =
        "Invalid phone number.";
    }

    // Validate email
    if (trimmedData?.email && !validateEmail(trimmedData.email)) {
      errors.email = "Invalid email address. Please enter a valid email.";
    }

    // Validate password
    if (trimmedData?.password && !validatePassword(trimmedData.password)) {
      errors.password = "Password must be at least 8 characters long.";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await addUser(trimmedData).unwrap();
      setFormData({
        userName: "",
        phoneNo: "",
        email: "",
        userId: "",
        password: "",
        userRole: "",
      });
      setSuccessMessage("User added successfully!");
      setErrorMessage("");
      setValidationErrors({});
      onClose();
      onSuccess();
      if (showNotification) {
        showNotification(successMessage);
      }
    } catch (error) {
      if (error.status === 401) {
        dispatch(setLogout());
        navigate("/login");
        return;
      }
      setErrorMessage(error.data?.error || "Failed to add sub-user");
      console.log("Failed to add sub-user: ", error);
    }
  };
  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeModelWithoutSave();
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 pt-10">
      <div
        className="bg-white pt-3 rounded-lg shadow-lg max-w-3xl w-full md:w-5/6 lg:w-2/3 xl:w-1/2 h-full md:h-5/6 flex flex-col"
        ref={modalRef}
      >
        {/* Title Section */}
        <div className="bg-white p-3 rounded-t-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Add New Sub User
            </h2>
            <button
              onClick={closeModelWithoutSave}
              className="text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Divider Line */}
        <hr className="border-t border-gray-300" />

        {/* Form Section */}
        <div className="bg-gray-100 p-4 rounded-b-lg flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {errorMessage && (
              <div className="text-red mb-4">{errorMessage}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={formData?.userName}
                    onChange={handleChange}
                    autoComplete="off"
                    placeholder="Enter full name"
                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue"
                    required
                  />
                  {validationErrors.userName && (
                    <div className="text-red text-sm">
                      {validationErrors.userName}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="phoneNo"
                    value={formData?.phoneNo}
                    onChange={handleChange}
                    autoComplete="off"
                    placeholder="Enter phone number"
                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue"
                    required
                  />
                  {validationErrors.phoneNo && (
                    <div className="text-red-600 text-sm">
                      {validationErrors.phoneNo}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData?.email}
                    onChange={handleChange}
                    autoComplete="off"
                    placeholder="Enter email address"
                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue"
                    required
                  />
                  {validationErrors.email && (
                    <div className="text-red text-sm">
                      {validationErrors.email}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700">
                    User ID <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="userId"
                    value={formData?.userId}
                    onChange={handleChange}
                    autoComplete="off"
                    placeholder="Enter user ID"
                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue"
                    required
                  />
                  {validationErrors.userId && (
                    <div className="text-red text-sm">
                      {validationErrors.userId}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700">
                    Password <span className="text-red">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData?.password}
                    onChange={handleChange}
                    autoComplete="off"
                    placeholder="Enter password"
                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue"
                    required
                  />
                  {validationErrors.password && (
                    <div className="text-red text-sm">
                      {validationErrors.password}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700">
                    User Role <span className="text-red">*</span>
                  </label>
                  <select
                    name="userRole"
                    value={formData?.userRole}
                    onChange={handleChange}
                    autoComplete="off"
                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue"
                    required
                  >
                    <option value="">Select Role</option>
                    {roles?.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.roleName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={closeModelWithoutSave}
                className="bg-red text-white hover:opacity-90 px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green text-white hover:opacity-90 px-6 py-2 rounded-lg"
              >
                Add User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubUserFormModal;
