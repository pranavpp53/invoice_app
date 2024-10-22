import { useState, useEffect } from "react";
import CustomerForm from "../Form/CustomerForm";
import {
  useGetAllFilteredCustomersQuery,
  useDeleteCustomerMutation,
  useAddCustomerMutation,
  useUpdateCustomerMutation,
} from "../api/customersApiSlice.js";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useGetSettingsDataQuery } from "../api/settingsApiSlice.js";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Pagination from "../assets/Pagination.jsx";
import PrivateRoute from "../utils/PrivateRoute.jsx";
import { jwtDecode } from "jwt-decode";


const Customers = () => {
  const user = useSelector((state) => state.auth);
  const token = useSelector((state) => state.auth.token);
  const { userRole, permissions } = user;
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: settingsData } = useGetSettingsDataQuery({ id: userId });
  const tableHeadBg = settingsData?.settingsData?.tableHeadBg || "#206bc4";
  const tableHeadText = settingsData?.settingsData?.tableHeadText || "white";
  const checkboxValues = settingsData?.settingsData;


  // Add state to track form data
  const [formData, setFormData] = useState({
    customerCode: "",
    companyLegalName: "",
    companyBrandName: "",
    userName: "",
    password: "",
    address: "",
    phone: "",
    email: "",
    contactPersonal: "",
    contactPersonalPhone: "",
    contactPersonalEmail: "",
    website: "",
    plan: "",
    status: "",
    createdAt: "",
    createdBy: "",
    editedAt: "",
    editedBy: "",
    _id: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [noDataFound, setNoDataFound] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);


  const { data, isLoading, isError, refetch } = useGetAllFilteredCustomersQuery(
    {
      search: searchTerm,
      page: currentPage,
      limit: itemsPerPage
    },
    { refetchOnMountOrArgChange: true }
  );

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setCustomerData(customer);
      setIsEditing(true);
    } else {
      setCustomerData(null);
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (data) {
      setTotalPages(data?.totalPages);
      setNoDataFound(data?.customers.length === 0 && searchTerm !== "");
    }
  }, [data, searchTerm]);

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserId(decodedToken.userId);
    }
    if (settingsData?.settingsData?.pagenationLimit) {
      setItemsPerPage(settingsData.settingsData.pagenationLimit);
    }

  }, [settingsData,token]);

  const customersData = data?.customers || [];

  const [addCustomer] = useAddCustomerMutation();
  const [updateCustomer] = useUpdateCustomerMutation();
  const [deleteCustomer] = useDeleteCustomerMutation();

  useEffect(() => {
    refetch();
  }, [searchTerm, currentPage, refetch]);

  const handleAddCustomer = async (newCustomer) => {
    try {
      await addCustomer(newCustomer).unwrap();
      alert("Customer added successfully!");
      setIsModalOpen(false);
      setFormData({
        customerCode: "",
        companyLegalName: "",
        companyBrandName: "",
        userName: "",
        password: "",
        address: "",
        phone: "",
        email: "",
        contactPersonal: "",
        contactPersonalPhone: "",
        contactPersonalEmail: "",
        website: "",
        plan: "",
        status: "",
        createdAt: "",
        createdBy: "",
        editedAt: "",
        editedBy: "",
      });
      refetch();
    } catch (error) {      
      alert(error.data.error);
    }
  };

  const handleEditCustomer = async (updatedCustomer) => {
    if (!updatedCustomer._id) {
      alert("Customer ID is missing.");
      return;
    }

    try {
      await updateCustomer({
        id: updatedCustomer._id,
        ...updatedCustomer,
      }).unwrap();
      alert("Customer updated successfully!");
      setIsEditModalOpen(false);
      refetch();
    } catch (error) {
      alert("Failed to update customer.");
      if (err.status === 401) {
        dispatch(setLogout());
        navigate("/login");
        return;
      }
    }
  };

  const handleDelete = async (customerId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
    );
    if (confirmDelete) {
      try {
        await deleteCustomer(customerId).unwrap();
        alert("Customer deleted successfully!");
        refetch();
      } catch (error) {
        alert("Failed to delete customer.");
        if (err.status === 401) {
          dispatch(setLogout());
          navigate("/login");
          return;
        }
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // const openAddModal = () => {
  //   setCurrentCustomer(null);
  //   setIsModalOpen(true);
  // };

  const openEditModal = (customer) => {
    setCurrentCustomer(customer);
    setFormData(customer);
    setIsEditModalOpen(true);
  };

  const isAdmin = userRole === "admin";
  const customersPermissions = isAdmin
    ? {
      view: true,
      create: true,
      edit: true,
      delete: true,
    }
    : permissions.customers || {};

  return (
    <PrivateRoute isComponentLoading={isLoading}>
      <div className="bg-gray-100 min-h-screen pt-[80px] py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-4 sm:space-y-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 text-center sm:text-left">
                Customers
              </h2>
              {customersPermissions?.create && (
                <button
                  onClick={() => handleOpenModal()}
                  className="bg-indigo text-white hover:bg-blue rounded-lg px-6 py-2 text-sm sm:text-base"
                >
                  + Add New
                </button>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Filter</h3>
              <hr className="mb-4" />
              <div>
                <label
                  htmlFor="customer-search"
                  className="font-medium text-gray-700 mb-2 block"
                >
                  Search:
                </label>
                <input
                  type="text"
                  id="customer-search"
                  className="border border-gray-300 rounded-lg p-2 w-full sm:w-48 mb-4 sm:mb-0 focus:outline-none focus:ring-2 focus:ring-blue"
                  placeholder="Customer Name"
                  value={searchTerm}
                  autoComplete="off"
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg overflow-x-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Customer List
              </h3>
              <table className="min-w-full border-collapse bg-white shadow-sm rounded-lg text-sm">
                <thead>
                  <tr
                    style={{ backgroundColor: tableHeadBg, color: tableHeadText }}
                  >
                    <th className={`p-3 text-left ${checkboxValues?.tableBorder
                        ? "border border-gray-300"
                        : ""
                      }`}>No</th>
                    <th className={`p-3 text-left ${checkboxValues?.tableBorder
                        ? "border border-gray-300"
                        : ""
                      }`}>
                      Customer Code
                    </th>
                    <th className={`p-3 text-left ${checkboxValues?.tableBorder
                        ? "border border-gray-300"
                        : ""
                      }`}>
                      User Name
                    </th>
                    <th className={`p-3 text-left ${checkboxValues?.tableBorder
                        ? "border border-gray-300"
                        : ""
                      }`}>
                      Company
                    </th>
                    <th className={`p-3 text-left ${checkboxValues?.tableBorder
                        ? "border border-gray-300"
                        : ""
                      }`}>
                      Phone
                    </th>
                    <th className={`p-3 text-left ${checkboxValues?.tableBorder
                        ? "border border-gray-300"
                        : ""
                      }`}>
                      Email
                    </th>
                    <th className={`p-3 text-left ${checkboxValues?.tableBorder
                        ? "border border-gray-300"
                        : ""
                      }`}>Plan</th>
                    <th className={`p-3 text-left ${checkboxValues?.tableBorder
                        ? "border border-gray-300"
                        : ""
                      }`}>
                      Status
                    </th>
                    <th className={`p-3 text-center ${checkboxValues?.tableBorder
                        ? "border border-gray-300"
                        : ""
                      }`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td colSpan="6" className="text-center text-red">
                        Error loading customers
                      </td>
                    </tr>
                  ) : customersData.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center text-red">
                        No results found
                      </td>
                    </tr>
                  ) : (
                    customersData?.map((customer, index) => (
                      <tr key={customer._id} className={`
                        ${checkboxValues?.tableStripped ? "even:bg-white odd:bg-gray-50" : ""}
                        ${checkboxValues?.tableHover ? "hover:bg-gray-100" : ""}
                        ${checkboxValues?.tableBorder ? "border-b border-gray-300" : ""}   
                        `}>
                        <td className={`p-3 ${checkboxValues?.tableBorder
                                ? "border border-gray-300"
                                : ""
                                }`}>
                          {index + 1}
                        </td>
                        <td className={`p-3 ${checkboxValues?.tableBorder
                                ? "border border-gray-300"
                                : ""
                                }`}>
                          {customer.customerCode}
                        </td>
                        <td className={`p-3 ${checkboxValues?.tableBorder
                                ? "border border-gray-300"
                                : ""
                                }`}>
                          {customer.userName}
                        </td>
                        <td className={`p-3 ${checkboxValues?.tableBorder
                                ? "border border-gray-300"
                                : ""
                                }`}>
                          {customer.companyLegalName}
                        </td>
                        <td className={`p-3 ${checkboxValues?.tableBorder
                                ? "border border-gray-300"
                                : ""
                                }`}>
                          {customer.phone}
                        </td>
                        <td className={`p-3 ${checkboxValues?.tableBorder
                                ? "border border-gray-300"
                                : ""
                                }`}>
                          {customer.email}
                        </td>
                        <td className={`p-3 ${checkboxValues?.tableBorder
                                ? "border border-gray-300"
                                : ""
                                }`}>
                          {customer.plan}
                        </td>
                        <td className={`p-3 ${checkboxValues?.tableBorder
                                ? "border border-gray-300"
                                : ""
                                }`}>
                          {customer.status}
                        </td>
                        <td className={`p-3 text-center ${checkboxValues?.tableBorder
                                ? "border border-gray-300"
                                : ""
                                }`}>
                          <div className="flex justify-center space-x-2">
                            {customersPermissions.edit && (
                              <button
                                onClick={() => openEditModal(customer)}
                                className="bg-orange hover:bg-orange text-white font-bold py-1 px-2 rounded flex items-center text-sm"
                              >
                                <FaEdit />
                              </button>
                            )}
                            {customersPermissions.delete && (
                              <button
                                onClick={() => handleDelete(customer._id)}
                                className="bg-red hover:bg-red text-white font-bold py-1 px-2 rounded flex items-center text-sm"
                              >
                                <FaTrashAlt />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {/* Pagination Component */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>

            {isModalOpen && (
              <CustomerForm
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleAddCustomer}
                customerData={customerData}
                isEditing={isEditing}
                formData={formData}
                setFormData={setFormData}
              />
            )}

            {isEditModalOpen && currentCustomer && (
              <CustomerForm
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditCustomer}
                customerData={currentCustomer}
                isEditing={true}
                formData={formData}
                setFormData={setFormData}
              />
            )}
          </div>
        </div>
        <div className="mb-24"></div>
      </div>
    </PrivateRoute>
  );
};

export default Customers;
