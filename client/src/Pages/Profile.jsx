import React, { useEffect, useState } from "react";
import {
  useChangePasswordMutation,
  useEditUserMutation,
} from "../api/userApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { setLogout, updateUserProfile } from "../auth/authSlice";
import { useNavigate } from "react-router-dom";
import { updateUser } from "../auth/authSlice.js";

const Profile = () => {
  const user = useSelector((state) => state.auth);
  const [editPassword, setEditPassword] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileData, setProfileData] = useState({});
  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();
  const [editUser, { isLoading: isEditingProfile }] = useEditUserMutation();

  useEffect(() => {
    setProfileData({
      userName: user.user.userName,
      email: user.user.email,
      phoneNo: user.user.phoneNo,
    });
  }, [user.user]);

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handlePasswordChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const handleEditPasswordToggle = () => {
    setEditPassword(!editPassword);
    setMessage("");
    setPasswordError("");
  };

  const handleEditProfileToggle = () => {
    setEditProfile(!editProfile);
    setMessage("");
  };

  const handleChangeProfile = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const result = await editUser({
        id: user.user._id,
        ...profileData,
      }).unwrap();

      if (result) {
        // Dispatch the updated user information to Redux
        dispatch(updateUserProfile(result.user));
        setEditProfile(false);
        setMessage(result.message || "Profile updated successfully.");
      } else {
        setMessage("No response received from the server.");
      }
    } catch (error) {
      setMessage(error.data?.message || "Failed to update profile.");
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (!validatePassword(newPassword)) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      const result = await changePassword({
        oldPassword,
        newPassword,
      }).unwrap();

      console.log("Change Password API Result:", result);

      if (result) {
        dispatch(setLogout());
        navigate("/login");
        setMessage(result.message || "Password updated successfully.");
      } else {
        setMessage("No response received from the server.");
      }
    } catch (error) {
      setMessage(error.data?.message || "Failed to update password.");
    }

    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="bg-[#EEF4F7] min-h-screen pt-[100px] pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0 bg-gradient-to-br from-blue to-indigo p-8 text-white">
            <div className="text-center">
              <img
                className="h-32 w-32 rounded-full mx-auto border-4 border-white shadow-inner"
                src="https://i.postimg.cc/W1SH9xpn/307ce493-b254-4b2d-8ba4-d12c080d6651.jpg"
                alt="User avatar"
              />
              <h2 className="mt-4 text-2xl font-semibold">
                {profileData?.userName}
              </h2>
              <p className="mt-2 text-white">{user?.user?.roleName}</p>
            </div>
          </div>
          <div className="p-8 w-full">
            <h1 className="text-3xl font-bold text-gray mb-6">User Profile</h1>
            <div className="space-y-6">
              {!editProfile ? (
                <>
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-4 text-sm font-medium text-gray-600">Username</td>
                        <td className="py-2 px-4 text-md text-gray-800">{profileData?.userName}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4 text-sm font-medium text-gray-600">Email</td>
                        <td className="py-2 px-4 text-md text-gray-800">{profileData?.email}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4 text-sm font-medium text-gray-600">Mobile</td>
                        <td className="py-2 px-4 text-md text-gray-800">{profileData?.phoneNo}</td>
                      </tr>
                    </tbody>
                  </table>
                  <button
                    onClick={handleEditProfileToggle}
                    className="w-full px-4 mt-2 py-2 bg-gradient-to-r from-blue to-indigo text-white rounded-md hover:from-blue hover:to-indigo transition duration-300 shadow-md"
                  >
                    Edit Profile
                  </button>
                </>
              ) : (
                <form onSubmit={handleSubmitProfile} className="space-y-4">
                  <div>
                    <label
                      className="block text-gray text-sm font-medium mb-2"
                      htmlFor="userName"
                    >
                      Username
                    </label>
                    <input
                      id="userName"
                      name="userName"
                      className="w-full px-3 py-2 border border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
                      value={profileData?.userName}
                      onChange={handleChangeProfile}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray text-sm font-medium mb-2"
                      htmlFor="email"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      className="w-full px-3 py-2 border border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
                      value={profileData?.email}
                      onChange={handleChangeProfile}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray text-sm font-medium mb-2"
                      htmlFor="phoneNo"
                    >
                      Mobile No
                    </label>
                    <input
                      id="phoneNo"
                      name="phoneNo"
                      className="w-full px-3 py-2 border border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
                      value={profileData?.phoneNo}
                      onChange={handleChangeProfile}
                    />
                  </div>
                  {message && (
                    <div
                      className={`text-sm mb-2 ${
                        message.includes("success") ? "text-green" : "text-red"
                      }`}
                    >
                      {message}
                    </div>
                  )}
                  <div className="flex items-center space-x-4">
                    <button
                      type="submit"
                      className="flex-grow px-4 py-2 bg-green text-white rounded-md hover:bg-green transition duration-300 shadow-md"
                      disabled={isEditingProfile}
                    >
                      {isEditingProfile ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 border border-red text-red rounded-md hover:bg-red hover:text-white transition duration-300"
                      onClick={handleEditProfileToggle}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
              <div className="pt-6 border-t border-gray">
                <h3 className="text-xl font-semibold text-gray mb-4">
                  Account Settings
                </h3>
                {!editPassword ? (
                  <button
                    onClick={handleEditPasswordToggle}
                    className="w-full px-4 mt-4 py-2 bg-gradient-to-r from-blue to-indigo text-white rounded-md hover:from-blue hover:to-indigo transition duration-300 shadow-md"
                  >
                    Change Password
                  </button>
                ) : (
                  <form
                    onSubmit={handleSubmitPassword}
                    className="space-y-4 mt-4"
                  >
                    <div>
                      <label
                        className="block text-gray text-sm font-medium mb-2"
                        htmlFor="old-password"
                      >
                        Old Password
                      </label>
                      <input
                        type="password"
                        id="old-password"
                        className="w-full px-3 py-2 border border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
                        value={oldPassword}
                        onChange={handlePasswordChange(setOldPassword)}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-gray text-sm font-medium mb-2"
                        htmlFor="new-password"
                      >
                        New Password
                      </label>
                      <input
                        type="password"
                        id="new-password"
                        className="w-full px-3 py-2 border border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
                        value={newPassword}
                        onChange={handlePasswordChange(setNewPassword)}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-gray text-sm font-medium mb-2"
                        htmlFor="confirm-password"
                      >
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirm-password"
                        className="w-full px-3 py-2 border border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
                        value={confirmPassword}
                        onChange={handlePasswordChange(setConfirmPassword)}
                      />
                    </div>
                    {passwordError && (
                      <div className="text-red text-sm mb-2">
                        {passwordError}
                      </div>
                    )}
                    {message && (
                      <div className="text-green text-sm mb-2">{message}</div>
                    )}
                    <div className="flex items-center space-x-4">
                      <button
                        type="submit"
                        className="flex-grow px-4 py-2 bg-green text-white rounded-md hover:bg-green transition duration-300 shadow-md"
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword ? "Saving..." : "Save Password"}
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 border border-red text-red rounded-md hover:bg-red hover:text-white transition duration-300"
                        onClick={handleEditPasswordToggle}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
