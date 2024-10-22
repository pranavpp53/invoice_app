import React, { useState, useEffect } from "react";
import { FaTrashAlt, FaEye, FaEdit, FaSave, FaFileCsv } from "react-icons/fa";
import Search from "../assets/Search";
import TableWithPagination from "../assets/TableWithPagination";
import {
  useDeleteInvoiceByIdMutation,
  useGetDocumentWiseInvoicesQuery,
  useUpdateInvoiceByIdMutation,
} from "../api/invoiceApiSlice";
import PrivateRoute from "../utils/PrivateRoute.jsx";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useGetAllLedgersQuery } from "../api/ledgerApiSlice";

const Invoices = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { documentId } = useParams();
  const location = useLocation();
  const { documentNumber } = location.state || {};
  const user = useSelector((state) => state.auth);
  const { userRole, permissions } = user;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [status, setStatus] = useState({});
  const [ledger, setLedger] = useState({});
  const [paymentMode, setPaymentMode] = useState({});

  // Fetch filtered invoices based on documentId and search term
  const {
    data: invoices,
    isLoading,
    refetch,
  } = useGetDocumentWiseInvoicesQuery({
    id: documentId,
    search: searchTerm,
    page: currentPage,
    limit: itemsPerPage,
  });

  const baseUrl = import.meta.env.VITE_BASE_URL;

  const { data: ledgersData = [], isError, error } = useGetAllLedgersQuery();

  const [deleteInvoice] = useDeleteInvoiceByIdMutation();
  const [updateInvoice] = useUpdateInvoiceByIdMutation();

  useEffect(() => {
    refetch();
  }, [searchTerm, currentPage, documentId, refetch]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this invoice?"
    );
    if (confirmDelete) {
      try {
        await deleteInvoice(id).unwrap();
        alert("Invoice deleted successfully!");
        await refetch();
      } catch (error) {
        alert("Failed to delete invoice.");
        if (error.status === 401) {
          dispatch(setLogout());
          navigate("/login");
          return;
        }
      }
    }
  };

  const handleView = (documentId, invoiceId) => {
    navigate(`/documents/${documentId}/${invoiceId}`);
  };

  const handleEditClick = (id) => {
    setEditingInvoiceId(id);
    const invoice = invoices.find((inv) => inv._id === id);
    setStatus((prevStatus) => ({
      ...prevStatus,
      [id]: invoice?.billStatus || "pending",
    }));
    setLedger((prevLedger) => ({
      ...prevLedger,
      [id]: invoice?.ledgerName || "",
    }));
  };

  const handleSaveClick = async (invoiceId) => {
    const currentInvoice = invoices.find((inv) => inv._id === invoiceId);
    const currentStatus = currentInvoice?.billStatus;
    const selectedLedger = ledger[invoiceId] || currentInvoice?.ledger;
    const selectedPaymentMode =
      paymentMode[invoiceId] || currentInvoice?.paymentMode;

    // Checking the status is being updated from "pending" to "reviewed" or "approved" and ledger is not selected
    if (
      (status[invoiceId] === "reviewed" || status[invoiceId] === "approved") &&
      selectedLedger === "not selected"
    ) {
      alert("Please select a ledger before changing the status.");
      return;
    }

    try {
      const updatedInvoiceData = {
        billStatus: status[invoiceId] || "pending",
        ledger: selectedLedger,
        paymentMode: selectedPaymentMode,
      };

      const response = await updateInvoice({
        invoiceId,
        invoiceData: updatedInvoiceData,
      }).unwrap();

      alert("Invoice updated successfully!");
      setEditingInvoiceId(null);
      refetch();
    } catch (error) {
      alert("Failed to update invoice.", error);
    }
  };

  const headers = [
    "No",
    "Invoice",
    "Invoice Number",
    "Invoice Date",
    "TRN Number",
    "Company Name",
    "Gross Amount",
    "VAT Amount",
    "Total Amount",
    "Payment Mode",
    "Ledger",
    "Status",
    "Actions",
  ];

  const renderRow = (invoice, index) => (
    <tr key={invoice._id} className="hover:bg-gray-50">
      <td
        className={`p-3 border border-gray-300 ${
          invoice.duplicateStatus ? "text-red" : ""
        }`}
      >
        {index + 1}
      </td>
      <td
        className={`p-3 border border-gray-300 ${
          invoice.duplicateStatus ? "text-red" : ""
        }`}
      >
        <a
          href={`${baseUrl}${invoice?.imageUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={`${baseUrl}${invoice?.imageUrl}`}
            alt="Invoice"
            className={`w-24 h-auto border border-gray-300 shadow-md ${
              invoice.duplicateStatus ? "border-red" : ""
            } `}
          />
        </a>
      </td>
      <td
        className={`p-3 border border-gray-300 ${
          invoice.duplicateStatus ? "text-red" : ""
        }`}
      >
        {invoice?.invoiceNumber}
      </td>
      <td
        className={`p-3 border border-gray-300 ${
          invoice.duplicateStatus ? "text-red" : ""
        }`}
      >
        {invoice?.invoiceDate}
      </td>
      <td
        className={`p-3 border border-gray-300 ${
          invoice.duplicateStatus ? "text-red" : ""
        }`}
      >
        {invoice?.trnNumber}
      </td>
      <td
        className={`p-3 border border-gray-300 ${
          invoice.duplicateStatus ? "text-red" : ""
        }`}
      >
        {invoice?.companyName}
      </td>
      <td
        className={`p-3 border border-gray-300 ${
          invoice.duplicateStatus ? "text-red" : ""
        }`}
      >
        {invoice?.grossAmount}
      </td>
      <td
        className={`p-3 border border-gray-300 ${
          invoice.duplicateStatus ? "text-red" : ""
        }`}
      >
        {invoice?.vatTotal}
      </td>
      <td
        className={`p-3 border border-gray-300 ${
          invoice.duplicateStatus ? "text-red" : ""
        }`}
      >
        {invoice?.totalAmount}
      </td>
      <td
        className={`p-3 border border-gray-300 ${
          invoice.duplicateStatus ? "text-red" : ""
        }`}
      >
        {editingInvoiceId === invoice._id ? (
          <select
            value={paymentMode[invoice._id] || invoice?.paymentMode}
            onChange={(e) =>
              setPaymentMode((prevMode) => ({
                ...prevMode,
                [invoice._id]: e.target.value,
              }))
            }
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Payment Mode</option>
            <option value="cash">Cash</option>
            <option value="credit">Credit</option>
            <option value="bank">Bank</option>
            <option value="other">Other</option>
          </select>
        ) : (
          invoice?.paymentMode
        )}
      </td>
      <td
        className={`p-3 border border-gray-300 ${
          invoice.duplicateStatus ? "text-red" : ""
        }`}
      >
        {editingInvoiceId === invoice._id ? (
          <select
            value={ledger[invoice._id] || invoice?.ledger}
            onChange={(e) =>
              setLedger((prevLedger) => ({
                ...prevLedger,
                [invoice._id]: e.target.value,
              }))
            }
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Ledger</option>
            {ledgersData.map((ledgerItem) => (
              <option key={ledgerItem.ledgerId} value={ledgerItem.ledgerName}>
                {ledgerItem.ledgerName}
              </option>
            ))}
          </select>
        ) : (
          invoice?.ledger
        )}
      </td>

      <td
        className={`p-3 border border-gray-300 ${
          invoice.duplicateStatus ? "text-red" : ""
        }`}
      >
        {editingInvoiceId === invoice._id ? (
          <select
            value={status[invoice._id] || invoice?.billStatus}
            onChange={(e) =>
              setStatus((prevStatus) => ({
                ...prevStatus,
                [invoice._id]: e.target.value,
              }))
            }
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
          </select>
        ) : (
          invoice?.billStatus
        )}
      </td>
      <td className="p-3 border border-gray-300 text-center">
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => handleView(documentId, invoice._id)}
            className="bg-green text-white font-bold py-2 px-4 rounded flex items-center justify-center transition duration-300 ease-in-out transform hover:bg-[#1b7d32]"
            title="View Document"
          >
            <FaEye className="text-white" />
          </button>
          {editingInvoiceId === invoice._id ? (
            <button
              onClick={() => handleSaveClick(invoice._id)}
              className="bg-green hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <FaSave />
            </button>
          ) : (
            <button
              onClick={() => handleEditClick(invoice._id)}
              className="bg-yellow hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <FaEdit />
            </button>
          )}
          <button
            onClick={() => handleDelete(invoice._id)}
            className="bg-red hover:bg-rose-950 text-white font-bold py-2 px-4 rounded items-center"
          >
            <FaTrashAlt />
          </button>
        </div>
      </td>
    </tr>
  );

  //convert the invoice data to CSV format
  const convertToCSV = (data) => {
    const headers = [
      "Invoice Number",
      "Invoice Date",
      "TRN Number",
      "Company Name",
      "Gross Amount",
      "VAT Amount",
      "Total Amount",
      "Payment Mode",
      "Ledger",
      "Status",
    ];

    //heading as the first row
    const documentHeading = [`Invoices for Document: ${documentNumber}`];

    const rows = data.map((invoice) => [
      invoice.invoiceNumber,
      invoice.invoiceDate,
      invoice.trnNumber,
      invoice.companyName,
      invoice.grossAmount,
      invoice.vatTotal,
      invoice.totalAmount,
      invoice.paymentMode,
      invoice.ledger,
      invoice.billStatus,
    ]);

    // Join the heading, headers, and rows into a single CSV string
    return [documentHeading, headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
  };

  // handle the CSV download
  const handleDownloadCSV = () => {
    const csvData = convertToCSV(invoices || []);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "invoices.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PrivateRoute isComponentLoading={isLoading}>
      <div className="bg-gray-100 min-h-screen pt-[80px] py-8">
        <div className="md:container md:mx-auto md:px-4">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-row justify-between items-center mb-4">
              <h1 className="text-2xl font-bold mb-4">
                Invoices for Document: {documentNumber}
              </h1>
              {/* Download CSV Button */}
              <button
                onClick={handleDownloadCSV}
                className="bg-blue text-white hover:bg-blue rounded-lg px-4 py-1 text-xs sm:text-base sm:px-6 sm:py-2 flex items-center"
              >
                <FaFileCsv className="mr-2" />
                Download Excel
              </button>
            </div>

            {/* Search Bar */}
            <Search
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search by invoice number or customer name"
            />

            {/* Invoice Table with Pagination */}
            <TableWithPagination
              headers={headers}
              data={invoices || []}
              renderRow={renderRow}
              currentPage={currentPage}
              totalPages={invoices?.totalPages || 1}
              onPageChange={setCurrentPage}
              tableHeadBg="#206bc4"
              tableHeadText="white"
              itemsPerPage={itemsPerPage}
              contentTitle="Invoices"
            />
          </div>
        </div>
        <div className="mb-24"></div>
      </div>
    </PrivateRoute>
  );
};

export default Invoices;
