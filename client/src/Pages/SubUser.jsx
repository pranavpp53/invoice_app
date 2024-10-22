import { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { MdBlock } from "react-icons/md";
import { CgUnblock } from "react-icons/cg";
import { CSVLink } from "react-csv";
import {
  useDeleteUserMutation,
  useEditUserMutation,
  useBlockUserMutation,
  useGetFilteredSubUsersQuery,
} from "../api/userApiSlice";
import { useGetAllRolesQuery } from "../api/roleApiSlice";
import SubUserFormModal from "../Form/SubUserFormModal";
import EditSubUserForm from "../Form/EditSubUserForm";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLogout } from "../auth/authSlice";
import { useGetSettingsDataQuery } from "../api/settingsApiSlice.js";
import { format } from "date-fns";
import PrivateRoute from "../utils/PrivateRoute.jsx";
import { jwtDecode } from "jwt-decode";
import ErrorMessage from "../Component/ErrorComponent.jsx";
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const SubUser = () => {
  const user = useSelector((state) => state.auth);
  const token = useSelector((state) => state.auth.token);
  const { userRole, permissions } = user;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userId, setUserId] = useState("");
  const { data: settingsData } = useGetSettingsDataQuery({ id: userId });
  const tableHeadBg = settingsData?.settingsData?.tableHeadBg || "#206bc4";
  const tableHeadText = settingsData?.settingsData?.tableHeadText || "white";
  const checkboxValues = settingsData?.settingsData;

  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isEditFormOpen, setEditFormOpen] = useState(false);


  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    userName: "",
    phoneNo: "+",
    email: "",
    userId: "",
    password: "",
    userRole: "",
  });

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserId(decodedToken.userId);
    }
    if (settingsData?.settingsData?.pagenationLimit) {
      setItemsPerPage(settingsData.settingsData.pagenationLimit);
    }

  }, [settingsData, token]);

  const closeModelWithoutSave = () => {
    setModalOpen(false);
  };

  const handleFormDataChange = (newFormData) => {
    setFormData(newFormData);
  };

  const {
    data: subUsersData = {},
    isLoading,
    isError,
    error,
    refetch,
  } = useGetFilteredSubUsersQuery({
    search: searchQuery,
    page: currentPage,
    limit: itemsPerPage,
  });
  const { data } = useGetAllRolesQuery();
  const roles = (data || []).filter((role) => role.roleName !== "admin");
  const [deleteSubUser] = useDeleteUserMutation();
  const [editUser] = useEditUserMutation();
  const [blockUser] = useBlockUserMutation();

  const subUsers = (subUsersData.subUsers || []).filter(
    (user) => user.userId !== "admin"
  );

  // Function to get role name by role ID
  const getRoleNameById = (roleId) => {
    const role = roles.find((role) => role._id === roleId);
    return role ? role.roleName : "Unknown Role";
  };

  // Function to format date and time
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const dateFormat = settingsData?.settingsData?.dateFormat || "yyyy-MM-dd";
    const timeFormat = settingsData?.settingsData?.timeFormat || "HH:mm:ss";
    const combinedFormat = `${dateFormat} ${timeFormat}`;
    return format(date, combinedFormat);
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedUser(null);
    refetch();
  };

  const handleDelete = async () => {
    if (userToDelete) {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete Sub-User "${userToDelete.userName}"? This action cannot be undone.`
      );
      if (!confirmDelete) return;

      try {
        await deleteSubUser(userToDelete._id).unwrap();
        window.alert(
          `Sub-user "${userToDelete.userName}" deleted successfully.`
        );
        setUserToDelete(null);
        refetch().then(() => {
          const totalItems = subUsersData.totalItems - 1;
          const totalPages = Math.ceil(totalItems / itemsPerPage);

          if (totalItems === 0) {
            setCurrentPage(1);
          } else if (currentPage > totalPages) {
            setCurrentPage(totalPages);
          }
        });
      } catch (err) {
        if (err.status === 401) {
          dispatch(setLogout());
          navigate("/login");
          return;
        }
      }
    }
  };

  // Handle block
  const handleBlockUser = async (user) => {
    if (!user._id) {
      return;
    }
    try {
      const action = user.isBlocked ? "unblock" : "block";
      await blockUser(user._id).unwrap();
      alert(`Sub-user "${user.userName}" ${action}ed successfully.`);
      refetch();
    } catch (err) {
      if (err.status === 401) {
        dispatch(setLogout());
        navigate("/login");
        return;
      }
    }
  };

  // Handle edit
  const handleEdit = async (updatedUser) => {
    if (!selectedUser?._id) {
      return;
    }
    try {
      await editUser({ id: selectedUser._id, ...updatedUser }).unwrap();
      alert(`Sub-user "${updatedUser.userName}" updated successfully.`);
      setEditFormOpen(false);
      refetch();
    } catch (err) {
      if (err.status === 401) {
        dispatch(setLogout());
        navigate("/login");
        return;
      }
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > subUsersData.totalPages) return;
    setCurrentPage(page);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // CSV Data
  const csvData = subUsers.map((user) => ({
    "Full Name": user.userName,
    "User ID": user.userId,
    "User Role": getRoleNameById(user.userRole),
    Phone: user.phoneNo,
    Email: user.email,
    "Last Logged In": formatDate(user.lastLoggedIn),
  }));

  const isAdmin = userRole === "admin";
  const subUserPermissions = isAdmin
    ? {
      view: true,
      create: true,
      edit: true,
      delete: true,
    }
    : permissions.subUser || {};

  return (
    <PrivateRoute isComponentLoading={isLoading}>
      <div className="bg-gray-100 min-h-screen pt-[80px] py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto px-6">
            {/* Sub User Title */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-4 sm:space-y-0">
              <h2 className="text-sm sm:text-2xl font-bold text-gray-800">
                Sub User
              </h2>
              {subUserPermissions.create && (
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setModalOpen(true);
                  }}
                  className="bg-blue text-white hover:bg-blue rounded-lg px-4 py-1 text-xs sm:text-base sm:px-6 sm:py-2"
                >
                  + Add New
                </button>
              )}
            </div>

            {/* Filter Section */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Filter
              </h3>
              <hr className="mb-4" />
              <div>
                <label
                  htmlFor="subuser-search"
                  className="font-medium text-gray-700 mb-2 block"
                >
                  Search:
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                  <input
                    type="text"
                    id="subuser-search"
                    className="border border-gray-300 rounded-lg p-2 flex-grow sm:flex-grow-0 sm:w-48 mb-4 sm:mb-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Full Name / User ID"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            {/* Sub User List */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Sub-User List
              </h3>
              <div className="overflow-x-auto">
                <div className="w-full table">
                {isError ? (
                  <ErrorMessage
                    message={error?.data?.message || "Error loading sub users"}
                  />
                ) : (
                  <>
                  <table className="min-w-full  bg-white shadow-sm rounded-lg text-sm">
                    <thead>
                      <tr
                        style={{
                          backgroundColor: tableHeadBg,
                          color: tableHeadText,
                        }}
                      >
                        <th
                          className={`p-3 text-left ${checkboxValues?.tableBorder
                            ? "border border-gray-300"
                            : ""
                            }`}
                        >
                          No
                        </th>
                        <th
                          className={`p-3 text-left ${checkboxValues?.tableBorder
                            ? "border border-gray-300"
                            : ""
                            }`}
                        >
                          Full Name
                        </th>
                        <th
                          className={`p-3 text-left ${checkboxValues?.tableBorder
                            ? "border border-gray-300"
                            : ""
                            }`}
                        >
                          User ID
                        </th>
                        <th
                          className={`p-3 text-left ${checkboxValues?.tableBorder
                            ? "border border-gray-300"
                            : ""
                            }`}
                        >
                          User Role
                        </th>
                        <th
                          className={`p-3 text-left ${checkboxValues?.tableBorder
                            ? "border border-gray-300"
                            : ""
                            }`}
                        >
                          Phone
                        </th>
                        <th
                          className={`p-3 text-left ${checkboxValues?.tableBorder
                            ? "border border-gray-300"
                            : ""
                            }`}
                        >
                          Email
                        </th>
                        <th
                          className={`p-3 text-left ${checkboxValues?.tableBorder
                            ? "border border-gray-300"
                            : ""
                            }`}
                        >
                          Last Logged In
                        </th>
                        <th
                          className={`p-3 text-left ${checkboxValues?.tableBorder
                            ? "border border-gray-300"
                            : ""
                            }`}
                        >
                          User Status
                        </th>
                        <th
                          className={`p-3 text-left ${checkboxValues?.tableBorder
                            ? "border border-gray-300"
                            : ""
                            }`}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan="4" className="relative h-24">
                            <div className="absolute inset-0 flex justify-center items-center">
                              Loading...
                            </div>
                          </td>
                        </tr>
                      ) : isError ? (
                        <tr>
                          <td colSpan="4" className="text-center text-red">
                            {error?.data?.message}
                          </td>
                        </tr>
                      ) : (
                        subUsers?.map((user, index) => (
                          <tr
                            key={user._id}
                            className={`
                    ${checkboxValues?.tableStripped ? "even:bg-white odd:bg-gray-50" : ""}
                    ${checkboxValues?.tableHover ? "hover:bg-gray-100" : ""}
                    ${checkboxValues?.tableBorder ? "border-b border-gray-300" : ""}   
                    `}
                          >
                            <td
                              className={`p-3 ${checkboxValues?.tableBorder
                                ? "border border-gray-300"
                                : ""
                                }`}
                            >
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                            <td
                              className={`p-3 ${checkboxValues?.tableBorder
                                ? "border border-gray-300"
                                : ""
                                }`}
                            >
                              {user.userName}
                            </td>
                            <td
                              className={`p-3 ${checkboxValues?.tableBorder
                                ? "border border-gray-300"
                                : ""
                                }`}
                            >
                              {user.userId}
                            </td>
                            <td
                              className={`p-3 ${checkboxValues?.tableBorder
                                ? "border border-gray-300"
                                : ""
                                }`}
                            >
                              {getRoleNameById(user.userRole)}
                            </td>
                            <td
                              className={`p-3 ${checkboxValues?.tableBorder
                                ? "border border-gray-300"
                                : ""
                                }`}
                            >
                              {user.phoneNo}
                            </td>
                            <td
                              className={`p-3 ${checkboxValues?.tableBorder
                                ? "border border-gray-300"
                                : ""
                                }`}
                            >
                              {user.email}
                            </td>
                            <td
                              className={`p-3 ${checkboxValues?.tableBorder
                                ? "border border-gray-300"
                                : ""
                                }`}
                            >
                              {formatDate(user.lastLoggedIn)}
                            </td>
                            <td
                              className={`p-3 ${checkboxValues?.tableBorder
                                ? "border border-gray-300"
                                : ""
                                }`}
                            >
                              {user.isBlocked ? "Blocked" : "Active"}
                            </td>
                            <td
                              className={`p-3 ${checkboxValues?.tableBorder
                                ? "border border-gray-300"
                                : ""
                                }`}
                            >
                              <div className="flex justify-center items-center">
                                {!isAdmin &&
                                  user._id === "66d831ccb27d2a161ea4f72e" ? (
                                  <span>Owner</span>
                                ) : (
                                  <div className="flex gap-4">
                                    {subUserPermissions.edit && (
                                      <button
                                        onClick={() => {
                                          setSelectedUser(user);
                                          setEditFormOpen(true);
                                        }}
                                        disabled={
                                          !isAdmin && user.userId === userId
                                        }
                                        className="bg-yellow hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded flex items-center"
                                      >
                                        <FaEdit />
                                      </button>
                                    )}
                                    {subUserPermissions.edit && (
                                      <button
                                        onClick={() => {
                                          setSelectedUser(user);
                                          handleBlockUser(user);
                                        }}
                                        disabled={
                                          !isAdmin && user.userId === userId
                                        }
                                        className={`${user.isBlocked
                                          ? "bg-blue"
                                          : "bg-orange"
                                          } text-white font-bold py-2 px-4 rounded flex items-center`}
                                      >
                                        {user.isBlocked ? (
                                          <CgUnblock />
                                        ) : (
                                          <MdBlock />
                                        )}
                                      </button>
                                    )}
                                    {subUserPermissions.delete && (
                                      <button
                                        onClick={() => {
                                          setUserToDelete(user);
                                          handleDelete();
                                        }}
                                        disabled={
                                          !isAdmin && user.userId === userId
                                        }
                                        className="bg-red hover:bg-rose-950 text-white font-bold py-2 px-4 rounded flex items-center"
                                      >
                                        <FaTrashAlt />
                                      </button>
                                    )}
                                    {!subUserPermissions.edit &&
                                      !subUserPermissions.delete && (
                                        <p className="text-gray-500 mt-2">
                                          Contact admin for more actions.
                                        </p>
                                      )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Download CSV Button */}
                  <div className="flex justify-between items-center mt-6">
                    <CSVLink
                      data={csvData}
                      filename={"sub_users.csv"}
                      className="bg-indigo text-white hover:bg-blue rounded-lg px-4 py-1 text-xs sm:px-6 sm:py-2 sm:text-base"
                    >
                      Download CSV
                    </CSVLink>

                    {/* pagination */}
                    <div className="flex items-center border rounded-lg space-x-1 sm:space-x-3 h-8 sm:h-12 px-2 sm:px-4">
                      <button
                        className={`text-blue hover:text-indigo transition duration-200 ease-in-out ${subUsersData.currentPage === 1
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                          }`}
                        onClick={() => handlePageChange(1)}
                        disabled={subUsersData.currentPage === 1}
                        aria-label="Go to first page"
                      >
                        <ChevronsLeft size={14} />
                      </button>
                      <button
                        className={`text-blue hover:text-indigo transition duration-200 ease-in-out ${subUsersData.currentPage === 1
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                          }`}
                        onClick={() =>
                          handlePageChange(subUsersData.currentPage - 1)
                        }
                        disabled={subUsersData.currentPage === 1}
                        aria-label="Go to previous page"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="text-blue text-xs sm:text-lg font-semibold px-1 sm:px-2">
                        {subUsersData.currentPage} / {subUsersData.totalPages}
                      </span>
                      <button
                        className={`text-blue hover:text-indigo transition duration-200 ease-in-out ${subUsersData.currentPage === subUsersData.totalPages
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                          }`}
                        onClick={() =>
                          handlePageChange(subUsersData.currentPage + 1)
                        }
                        disabled={
                          subUsersData.currentPage === subUsersData.totalPages
                        }
                        aria-label="Go to next page"
                      >
                        <ChevronRight size={14} />
                      </button>
                      <button
                        className={`text-blue hover:text-indigo transition duration-200 ease-in-out ${subUsersData.currentPage === subUsersData.totalPages
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                          }`}
                        onClick={() =>
                          handlePageChange(subUsersData.totalPages)
                        }
                        disabled={
                          subUsersData.currentPage === subUsersData.totalPages
                        }
                        aria-label="Go to last page"
                      >
                        <ChevronsRight size={14} />
                      </button>
                    </div>
                  </div>
                  </>
                )}
                </div>
              </div>
            </div>

            {/* Modals */}
            {isModalOpen && (
              <SubUserFormModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                closeModelWithoutSave={closeModelWithoutSave}
                formData={formData}
                setFormData={handleFormDataChange}
                onSuccess={() => {
                  window.alert("Sub User Created Successfully.");
                  setSuccessModalOpen(true);
                  setTimeout(() => setSuccessModalOpen(false), 3000); // Hide success modal after 3 seconds
                }}
              />
            )}

            {isEditFormOpen && selectedUser && (
              <EditSubUserForm
                isOpen={isEditFormOpen}
                onClose={() => setEditFormOpen(false)}
                user={selectedUser}
                onSuccess={() => {
                  setSuccessModalOpen(true);
                  setTimeout(() => setSuccessModalOpen(false), 3000); // Hide success modal after 3 seconds
                }}
                onEdit={handleEdit}
              />
            )}
          </div>
        </div>
        <div className="mb-24"></div>
      </div>
    </PrivateRoute>
  );
};

export default SubUser;
