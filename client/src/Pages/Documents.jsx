import React, { useState, useEffect } from "react";
import {
  useGetAllDocumentsQuery,
  useDeleteSingleDocumentMutation,
} from "../api/invoiceApiSlice";
import { useGetAllFilteredCustomersQuery } from "../api/customersApiSlice";
import { useNavigate } from "react-router-dom";
import TableWithPagination from "../assets/TableWithPagination";
import { FaEye, FaTrashAlt, FaEdit } from "react-icons/fa";
import PrivateRoute from "../utils/PrivateRoute.jsx";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { useGetSettingsDataQuery } from "../api/settingsApiSlice.js";

const Documents = () => {
  const token = useSelector((state) => state.auth.token);
  const userRole = useSelector((state) => state.auth.userRole);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("");
  const [documents, setDocuments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filter, setFilter] = useState("All");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  const { data: settingsData } = useGetSettingsDataQuery({ id: userId });
  const tableHeadBgColor = settingsData?.settingsData?.tableHeadBg || "#206bc4";
  const tableHeadTextColor =
    settingsData?.settingsData?.tableHeadText || "white";
  const checkboxValuesFromSettings = settingsData?.settingsData;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Date filter state
  const [fromDate, setFromDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Only set userId and role when token changes
  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserId(decodedToken.userId);
      setRole(decodedToken.role);
    }
  }, [token]);

  // Fetch documents only when userId and role are available
  const {
    data: invoicesData,
    isLoading: invoicesLoading,
    isError,
    error,
    refetch,
  } = useGetAllDocumentsQuery(
    {
      page: currentPage,
      limit: itemsPerPage,
      documentType: filter !== "All" ? filter : undefined,
      userId: userId || undefined,
      startDate: fromDate || undefined,
      endDate: endDate
        ? new Date(new Date(endDate).getTime() + 86400000).toISOString()
        : undefined,
    },
    {
      skip: !userId, // Skip fetching until userId is available
    }
  );

  const {
    data: customersData,
    isLoading: customersLoading,
    error: customersError,
  } = useGetAllFilteredCustomersQuery({
    search: "",
    page: 1,
    limit: 5,
  });

  useEffect(() => {
    if (invoicesData) {
      // Filter documents based on the search query
      const filteredDocuments = invoicesData.documents.filter((doc) => {
        const customerName = getCustomerName(doc.customerId);
        return (
          doc.documentNumber.includes(searchQuery) ||
          customerName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setDocuments(filteredDocuments);
      setTotalPages(invoicesData.totalPages || 1);
    }
  }, [invoicesData, searchQuery]);

  useEffect(() => {
    if (customersData) {
      setCustomers(customersData);
    }
  }, [customersData]);

  useEffect(() => {
    if (settingsData?.settingsData?.pagenationLimit) {
      setItemsPerPage(settingsData.settingsData.pagenationLimit);
    }
  }, [settingsData]);

  const getCustomerName = (customerId) => {
    if (!Array.isArray(customersData?.customers)) {
      return "Unknown";
    }
    const customer = customersData.customers.find(
      (cust) => cust._id === customerId
    );
    return customer ? customer.companyLegalName : "Unknown";
  };

  const handleViewDocument = (document) => {
    navigate(`/documents/${document._id}`, {
      state: { documentNumber: document.documentNumber },
    });
  };

  const handleExportClick = () => {
    navigate("/documents/exportinvoices");
  };

  const handleOpenModal = () => {
    navigate("/documents/add_document");
  };

  // Delete Document
  const [deleteDocument, { isLoading: isDeleting, error: deleteError }] =
    useDeleteSingleDocumentMutation();

  const handleDeleteDocument = async (id) => {
    const userConfirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!userConfirmed) {
      return;
    }

    try {
      const result = await deleteDocument(id).unwrap();
      alert("Document deleted successfully!");
      refetch();
    } catch (err) {
      const errorMessage =
        err?.data?.message ||
        err?.error ||
        err.message ||
        "Unknown error occurred";
      alert(`Failed to delete document: ${errorMessage}`);
    }
  };

  const handleEditClick = (docId) => {
    navigate(`/documents/edit_document/${docId}`);
  };

  const headers = [
    "No",
    "Document No.",
    "Date",
    ...(role !== "66f4f8ee37fecad218d9fc69" ? ["Customer Name"] : []),
    "Document Type",
    "Actions",
  ];

  const renderRow = (document, index) => {
    const serialNumber = (currentPage - 1) * 10 + (index + 1);
    const date = new Date(document?.createdAt).toLocaleDateString();

    return (
      <tr
        key={document.documentId || index}
        className={`${
          checkboxValuesFromSettings?.tableStripped
            ? "even:bg-white odd:bg-gray-50"
            : ""
        } ${
          checkboxValuesFromSettings?.tableHover ? "hover:bg-gray-100" : ""
        } ${
          checkboxValuesFromSettings?.tableBorder
            ? "border-b border-gray-300"
            : ""
        }`}
      >
        <td
          className={`p-3 ${
            checkboxValuesFromSettings?.tableBorder
              ? "border border-gray-300"
              : ""
          }`}
        >
          {serialNumber}
        </td>
        <td
          className={`p-3 ${
            checkboxValuesFromSettings?.tableBorder
              ? "border border-gray-300"
              : ""
          }`}
        >
          {document?.documentNumber}
        </td>
        <td
          className={`p-3 ${
            checkboxValuesFromSettings?.tableBorder
              ? "border border-gray-300"
              : ""
          }`}
        >
          {date}
        </td>
        {userRole !== "customer" && (
          <td
            className={`p-3 ${
              checkboxValuesFromSettings?.tableBorder
                ? "border border-gray-300"
                : ""
            }`}
          >
            {getCustomerName(document?.customerId)}
          </td>
        )}
        <td
          className={`p-3 ${
            checkboxValuesFromSettings?.tableBorder
              ? "border border-gray-300"
              : ""
          }`}
        >
          {document?.documentType}
        </td>
        <td
          className={`p-3 ${
            checkboxValuesFromSettings?.tableBorder
              ? "border border-gray-300"
              : ""
          }`}
        >
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => handleViewDocument(document)}
              className="bg-green text-white font-bold py-2 px-4 rounded flex items-center justify-center transition duration-300 ease-in-out transform hover:bg-[#1b7d32]"
              title="View Document"
            >
              <FaEye className="text-white" />
            </button>
            <button
              onClick={() => handleEditClick(document._id)}
              className="bg-yellow hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <FaEdit />
            </button>

            <button
              onClick={() => handleDeleteDocument(document._id)}
              className=" bg-red hover:bg-rose-950 text-white font-bold py-2 px-4 rounded items-center"
            >
              <FaTrashAlt />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const handleFilterSelect = (event) => {
    setFilter(event.target.value);
    setCurrentPage(1);
    refetch();
  };

  return (
    <PrivateRoute isComponentLoading={invoicesLoading || customersLoading}>
      <div className="bg-gray-100 min-h-screen pt-[80px] py-8">
        <div className="md:container md:mx-auto md:px-4">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-row justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 text-center sm:text-left">
                Documents
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={handleExportClick}
                  className="bg-blue text-white hover:bg-blue rounded-lg px-4 py-1 text-xs sm:text-base sm:px-6 sm:py-2"
                >
                  Export
                </button>

                <button
                  onClick={handleOpenModal}
                  className="bg-blue text-white hover:bg-blue rounded-lg px-4 py-1 text-xs sm:text-base sm:px-6 sm:py-2"
                >
                  + Add New
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Filter
              </h3>
              <hr className="mb-4" />

              <div className="flex items-center space-x-4 overflow-x-auto whitespace-nowrap pt-2">
                {/* Search Input */}
                <div className="relative flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by Document No. or Customer Name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                    />
                    <label className="absolute left-2 top-1 text-sm font-medium text-gray-700 transition-transform duration-300 transform -translate-y-4 bg-white px-1">
                      Document No.
                    </label>
                  </div>
                </div>

                {/* Document Type Filter */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <select
                      value={filter}
                      onChange={handleFilterSelect}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                    >
                      <option value="All">All</option>
                      <option value="sales">Sales</option>
                      <option value="purchase">Purchase</option>
                      <option value="expense">Expense</option>
                      <option value="legal">Legal Documents</option>
                      <option value="other">Other Documents</option>
                    </select>
                    <label className="absolute left-2 top-1 text-sm font-medium text-gray-700 transition-transform duration-300 transform -translate-y-4 bg-white px-1">
                      Document Type
                    </label>
                  </div>
                </div>

                {/* Date Filters */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="block w-full p-2 border border-gray-300 rounded-md"
                    />
                    <label className="absolute left-2 top-1 text-sm font-medium text-gray-700 transition-transform duration-300 transform -translate-y-4 bg-white px-1">
                      From
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="block w-full p-2 border border-gray-300 rounded-md"
                    />
                    <label className="absolute left-2 top-1 text-sm font-medium text-gray-700 transition-transform duration-300 transform -translate-y-4 bg-white px-1">
                      To
                    </label>
                  </div>
                </div>

                {/* Reset Button */}
                <div>
                  <button
                    onClick={() => {
                      setFilter("All");
                      setFromDate("");
                      setEndDate("");
                      setSearchQuery("");
                    }}
                    className="px-4 py-2 bg-red text-white rounded-lg hover:bg-red-600 transition duration-200"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <TableWithPagination
              headers={headers}
              data={documents}
              renderRow={renderRow}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              tableHeadBgColor={tableHeadBgColor}
              tableHeadTextColor={tableHeadTextColor}
              checkboxValuesFromSettings={checkboxValuesFromSettings}
              isError={isError}
              error={error}
              contentTitle="Documents"
            />
          </div>
        </div>
        <div className="mb-24"></div>
      </div>
    </PrivateRoute>
  );
};

export default Documents;
