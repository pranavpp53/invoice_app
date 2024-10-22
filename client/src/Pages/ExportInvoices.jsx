import React, { useState, useEffect } from "react";
import { useGetAllInvoicesQuery } from "../api/invoiceApiSlice";
import TableWithPagination from "../assets/TableWithPagination";
import { useSelector } from "react-redux";
import PrivateRoute from "../utils/PrivateRoute";
import { FaFileCsv } from "react-icons/fa";

const ExportInvoices = () => {
  const [dateFormat, setDateFormat] = useState("invoiceDate");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [billType, setBillType] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const userId = useSelector((state) => state.auth.userId);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const {
    data: invoicesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAllInvoicesQuery({
    dateFormat,
    startDate,
    endDate,
    billType: billType || undefined,
    companyName: companyName || undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  useEffect(() => {
    refetch();
  }, [
    dateFormat,
    startDate,
    endDate,
    billType,
    companyName,
    currentPage,
    itemsPerPage,
    refetch,
  ]);

  // Reset Filters
  const handleReset = () => {
    setDateFormat("invoiceDate");
    setStartDate("");
    setEndDate("");
    setBillType("All");
    setCompanyName("");
    setCurrentPage(1);
    refetch();
  };

  // Convert invoice data to CSV format
  const convertToCSV = (data) => {
    const headers = [
      "No",
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

    const rows = data.map((invoice, index) => [
      index + 1,
      invoice?.invoiceNumber || "",
      invoice?.invoiceDate || "",
      invoice?.trnNumber || "",
      invoice?.companyName || "",
      invoice?.grossAmount || "",
      invoice?.vatTotal || "",
      invoice?.totalAmount || "",
      invoice?.paymentMode || "",
      invoice?.ledger || "",
      invoice?.billStatus || "",
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  const handleDownloadCSV = () => {
    if (
      !invoicesData ||
      !Array.isArray(invoicesData) ||
      invoicesData.length === 0
    ) {
      alert("No data available to download.");
      return;
    }

    // Proceed with CSV generation
    const csvData = convertToCSV(invoicesData);
    console.log("Generated CSV Data:", csvData);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "invoices.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Table headers
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
  ];

  // Table row rendering
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
        {invoice?.paymentMode}
      </td>
      <td
        className={`p-3 border border-gray-300 ${
          invoice.duplicateStatus ? "text-red" : ""
        }`}
      >
        {invoice?.ledger}
      </td>
      <td
        className={`p-3 border border-gray-300 ${
          invoice.duplicateStatus ? "text-red" : ""
        }`}
      >
        {invoice?.billStatus}
      </td>
    </tr>
  );

  return (
    <PrivateRoute isComponentLoading={isLoading}>
      <div className="bg-gray-100 min-h-screen pt-[80px] py-8">
        <div className="md:container md:mx-auto md:px-4">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-row justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 text-center sm:text-left">
                Export Invoices
              </h2>

              <button
                onClick={handleDownloadCSV}
                className="bg-blue text-white hover:bg-blue rounded-lg px-4 py-1 text-xs sm:text-base sm:px-6 sm:py-2 flex items-center"
              >
                <FaFileCsv className="mr-2" />
                Download
              </button>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Filter
              </h3>
              <hr className="mb-4" />

              <div className="flex flex-nowrap items-center space-x-4 overflow-x-auto pt-2">
                {/* Date Format Select */}
                <div className="relative flex-shrink-0">
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                  >
                    <option value="invoiceDate">Invoice Date</option>
                    <option value="documentDate">Document Date</option>
                  </select>
                  <label className="absolute left-2 top-1 text-sm font-medium text-gray-700 transform -translate-y-4 bg-white px-1">
                    Date Format
                  </label>
                </div>

                {/* Start Date */}
                <div className="relative flex-shrink-0">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="block w-full p-2 border border-gray-300 rounded-md"
                  />
                  <label className="absolute left-2 top-1 text-sm font-medium text-gray-700 transform -translate-y-4 bg-white px-1">
                    From
                  </label>
                </div>

                {/* End Date */}
                <div className="relative flex-shrink-0">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="block w-full p-2 border border-gray-300 rounded-md"
                  />
                  <label className="absolute left-2 top-1 text-sm font-medium text-gray-700 transform -translate-y-4 bg-white px-1">
                    To
                  </label>
                </div>

                {/* Bill Type Select */}
                <div className="relative flex-shrink-0">
                  <select
                    value={billType}
                    onChange={(e) => setBillType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                  >
                    <option value="">Select Document Type</option>
                    <option value="sales">Sales</option>
                    <option value="purchase">Purchase</option>
                    <option value="expense">Expense</option>
                  </select>
                  <label className="absolute left-2 top-1 text-sm font-medium text-gray-700 transform -translate-y-4 bg-white px-1">
                    Document Type
                  </label>
                </div>

                {/* Company Name Search */}
                <div className="relative flex-shrink-0">
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Search by Company Name"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue"
                  />
                  <label className="absolute left-2 top-1 text-sm font-medium text-gray-700 transform -translate-y-4 bg-white px-1">
                    Company Name
                  </label>
                </div>

                {/* Reset Button */}
                <div>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-red text-white rounded-lg hover:bg-red-600 transition duration-200"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Table With Pagination */}
            <TableWithPagination
              headers={headers}
              data={invoicesData || []}
              renderRow={renderRow}
              currentPage={currentPage}
              totalPages={invoicesData?.totalPages || 1}
              onPageChange={(page) => setCurrentPage(page)}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(value) => setItemsPerPage(value)}
              isLoading={isLoading}
              isError={isError}
              error={error}
              showPagination={false}
              contentTitle="Invoices"
            />
          </div>
        </div>
        <div className="mb-24"></div>
      </div>
    </PrivateRoute>
  );
};

export default ExportInvoices;
