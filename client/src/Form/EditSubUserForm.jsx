import { useState, useEffect, useRef } from "react";
import { useGetAllRolesQuery } from "../api/roleApiSlice";

const EditSubUserForm = ({
  isOpen,
  onClose,
  user,
  onEdit,
  showNotification,
}) => {
  const [formData, setFormData] = useState({
    userName: "",
    phoneNo: "",
    email: "",
    userId: "",
    password: "",
    userRole: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const {
    data,
    isLoading: rolesLoading,
    error: rolesError,
  } = useGetAllRolesQuery();
  const modalRef = useRef();

  const roles = (data || []).filter((role) => role.roleName !== "admin");

  const getRoleNameById = (roleId) => {
    if (!roleId) {
      return "Unknown Role";
    }
    const role = roles.find((role) => role._id === roleId);
    return role ? role.roleName : "Unknown Role";
  };

  useEffect(() => {
    if (user && roles.length > 0) {
      setFormData({
        userName: user.userName || "",
        phoneNo: user.phoneNo || "",
        email: user.email || "",
        userId: user.userId || "",
        password: user.password || "",
        userRole: getRoleNameById(user.userRole) || "",
      });
    }
  }, [user, roles.length]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    setFormData((prev) => ({ ...prev, userRole: e.target.value }));
  };

  const validateFields = () => {
    const errors = {};
    const trimmedData = {
      userName: formData?.userName.trim(),
      phoneNo: formData?.phoneNo.trim(),
      email: formData?.email.trim(),
      userId: formData?.userId.trim(),
      password: formData?.password.trim(),
      userRole: formData?.userRole.trim(),
    };

    if (!trimmedData?.userName) {
      errors.userName = "Full Name is required.";
    }
    if (!trimmedData?.phoneNo) {
      errors.phoneNo = "Phone Number is required.";
    }
    if (!trimmedData?.email) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(trimmedData?.email)) {
      errors.email = "Invalid email address. Please enter a valid email.";
    }
    if (!trimmedData?.userId) {
      errors.userId = "User ID is required.";
    }
    if (trimmedData?.password && trimmedData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
    }
    if (!trimmedData?.userRole) {
      errors.userRole = "User Role is required.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFields()) {
      return;
    }

    try {
      const updatedUser = {
        ...formData,
        userRole: roles.find((role) => role.roleName === formData.userRole)
          ?._id,
      };
      await onEdit(updatedUser);
      showNotification("User updated successfully!");
      onClose();
    } catch (err) {
      setValidationErrors({
        submit: "Failed to update sub-user. Please try again.",
      });
      console.error("Failed to update sub-user: ", err);
    }
  };

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
            <h2 className="text-xl font-bold text-gray-800">Edit Sub-User</h2>
            <button
              onClick={onClose}
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
          {rolesLoading ? (
            <div>Loading roles...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {validationErrors.submit && (
                <div className="text-red mb-4">
                  {validationErrors.submit}
                </div>
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
                      className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {validationErrors.phoneNo && (
                      <div className="text-red text-sm">
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
                      className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {validationErrors.userId && (
                      <div className="text-red text-sm">
                        {validationErrors.userId}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData?.password}
                      onChange={handleChange}
                      autoComplete="off"
                      placeholder="Enter password"
                      className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      onChange={handleRoleChange}
                      autoComplete="off"
                      className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" disabled>
                        Select Role
                      </option>
                      {roles.map((role) => (
                        <option key={role._id} value={role.roleName}>
                          {role.roleName}
                        </option>
                      ))}
                    </select>
                    {validationErrors.userRole && (
                      <div className="text-red text-sm">
                        {validationErrors.userRole}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4 space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-red text-white hover:opacity-90 px-6 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green text-white hover:opacity-90 px-6 py-2 rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditSubUserForm;
