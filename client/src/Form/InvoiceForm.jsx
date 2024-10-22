
import React, { useState, useEffect, useRef } from "react";
import {
  useGetAllFilteredCustomersQuery,
  useGetSingleCustomerQuery,
} from "../api/customersApiSlice";
import {
  useUploadInvoiceMutation,
  useGetSingleDocumentQuery,
  useEditSingleDocumentMutation,
  useGetUniqueDocumentNameQuery,
} from "../api/invoiceApiSlice";
import { useNavigate, useParams } from "react-router-dom";
import PrivateRoute from "../utils/PrivateRoute.jsx";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { useGetSettingsDataQuery } from "../api/settingsApiSlice.js";
import { FaTrashAlt } from "react-icons/fa";

const InvoiceForm = () => {
  const [userId, setUserId] = useState("");
  const { data: settingsData } = useGetSettingsDataQuery({ id: userId });

  const tableHeadBgColor = settingsData?.settingsData?.tableHeadBg || "#206bc4";
  const tableHeadTextColor =
    settingsData?.settingsData?.tableHeadText || "white";
  const checkboxValuesFromSettings = settingsData?.settingsData;

  const { docId } = useParams();
  const isEditMode = Boolean(docId);
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const [backendError, setBackendError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(user?._id || "");
  const [documentType, setDocumentType] = useState("");
  const [images, setImages] = useState([]);
  const [documentId, setDocumentId] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [role, setRole] = useState("");
  // const [userId, setUserId] = useState("");
  const [customerId, setCustomerId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isTitleFetched, setIsTitleFetched] = useState(false);

  const [totalAmount, setTotalAmount] = useState("");
  const [vatTotal, setVatTotal] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [grossAmount, setGrossAmount] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");

  // Fetch unique document Title
  const { data: fetchedTitle, isLoading: isTitleLoading } =
    useGetUniqueDocumentNameQuery({
      skip: isEditMode,
    });

  useEffect(() => {
    if (fetchedTitle && !isTitleFetched) {
      setTitle(fetchedTitle);
      setIsTitleFetched(true);
    }
  }, [fetchedTitle, isTitleFetched]);

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      setRole(decodedToken.role);
      setUserId(decodedToken.userId);
    }
  }, [token]);

  const { data: userDetails } = useGetSingleCustomerQuery(userId, {
    skip: !userId, // Skip the query if userId is not set
  });

  useEffect(() => {
    if (userDetails && userDetails.customerData) {
      setCustomerId(userDetails.customerData._id);
      setSelectedCustomerId(userDetails.customerData._id);
    }
  }, [userDetails]);

  const {
    data: documentData,
    isError,
    refetch,
  } = useGetSingleDocumentQuery(docId);

  const [editDocument, { isLoading: isEditing }] =
    useEditSingleDocumentMutation();

  useEffect(() => {
    if (documentData) {
      setTitle(documentData?.data?.title);
      setDocumentType(documentData?.data?.documentType);
      setDescription(documentData?.data?.description);
      setPaymentMode(documentData?.data?.paymentMode);
      setSelectedCustomerId(documentData?.data?.customerId);
    }
  }, [documentData]);

  // Error states
  const [titleError, setTitleError] = useState("");
  const [customerError, setCustomerError] = useState("");
  const [documentTypeError, setDocumentTypeError] = useState("");
  const [imageError, setImageError] = useState("");

  // Fetch customers
  const { data: customersData, isLoading } = useGetAllFilteredCustomersQuery({
    search: searchTerm,
    page: 1,
    limit: 10,
  });

  const customers = Array.isArray(customersData?.customers)
    ? customersData.customers
    : [];

  const [uploadInvoice, { isLoading: isUploading }] =
    useUploadInvoiceMutation();

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "title":
        setTitle(value);
        break;
      case "description":
        setDescription(value);
        break;
      case "documentType":
        setDocumentType(value);
        break;
      case "paymentMode":
        setPaymentMode(value);
        break;
      case "totalAmount":
        setTotalAmount(value);
        break;
      case "vatTotal":
        setVatTotal(value);
        break;
      case "companyName":
        setCompanyName(value);
        break;
      case "grossAmount":
        setGrossAmount(value);
        break;
      case "invoiceDate":
        setInvoiceDate(value);
        break;
      default:
        break;
    }
  };

  const shouldShowAdditionalFields = !["purchase", "expense"].includes(
    documentType
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      handleEditSubmit(e);
    } else {
      handleAddSubmit(e);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const updatedDocument = {
        title: title?.trim() || "",
        description: description?.trim() || "",
        documentType: documentType?.trim() || "",
      };

      await editDocument({
        id: docId?.trim() || "",
        documentData: updatedDocument,
      }).unwrap();

      // Uploading new images if available
      if (images.length > 0) {
        for (const image of images) {
          const formData = new FormData();
          formData.append("image", image);
          formData.append("customerId", selectedCustomerId?.trim() || "");
          formData.append("documentType", documentType?.trim() || "");
          formData.append("paymentMode", paymentMode?.trim() || "");
          formData.append("title", title?.trim() || "");
          formData.append("description", description?.trim() || "");
          formData.append("documentId", docId?.trim() || "");

          // Conditionally add the extra fields if the document type is not "purchase" or "expense"
          if (documentType !== "purchase" && documentType !== "expense") {
            formData.append("totalAmount", totalAmount || 0);
            formData.append("vatTotal", vatTotal || 0);
            formData.append("companyName", companyName?.trim() || "");
            formData.append("grossAmount", grossAmount || 0);
            formData.append("invoiceDate", invoiceDate || "");
          }

          await uploadInvoice(formData).unwrap();
        }
      }

      await refetch();

      alert("Document updated successfully!");
      navigate("/documents");
    } catch (error) {
      console.error("Edit Error:", error);
      alert(error?.data?.message || "Failed to update the document.");
      setBackendError(error?.data?.message || "Failed to update the document.");
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // The documentId that will be used for all images
      let currentDocumentId = documentId;

      for (const image of images) {
        const formData = new FormData();
        formData.append("image", image);
        formData.append("customerId", selectedCustomerId.trim());
        formData.append("documentType", documentType.trim());
        formData.append("paymentMode", paymentMode.trim());
        formData.append("title", title.trim());
        formData.append("description", description.trim());

        // Add the documentId if it exists
        if (currentDocumentId) {
          formData.append("documentId", currentDocumentId);
        }

        // Conditionally add the extra fields if the document type is not "purchase" or "expense"
        if (documentType !== "purchase" && documentType !== "expense") {
          formData.append("totalAmount", totalAmount);
          formData.append("vatTotal", vatTotal);
          formData.append("companyName", companyName.trim());
          formData.append("grossAmount", grossAmount);
          formData.append("invoiceDate", invoiceDate);
        }

        // Upload the invoice and get the response
        const response = await uploadInvoice(formData).unwrap();

        // Set the documentId after the first upload
        if (!currentDocumentId) {
          currentDocumentId = response.result?.newInvoiceData?.documentId;

          if (currentDocumentId) {
            setDocumentId(currentDocumentId);
          }
        }
      }


      // Clear images and show success message
      setImages([]);
      alert("All invoices uploaded successfully!");
      window.location.reload();
      navigate("/documents");
    } catch (error) {
      // Handle error and show message
      alert(error?.data?.error || "Failed to upload images.");
      console.error(error);
      setBackendError(error?.data?.message || "Failed to upload images.");
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Add selected files to the state
    setImages((prevImages) => [...prevImages, ...files]);

    // Clear the input field after files are processed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    let isValid = true;

    setTitleError("");
    setCustomerError("");
    setDocumentTypeError("");
    setImageError("");

    if (!title?.trim()) {
      setTitleError("Title is required");
      isValid = false;
    }

    if (!documentType) {
      setDocumentTypeError("Document type is required");
      isValid = false;
    }

    // Only validate file requirement for non-sales documents
    if (!isEditMode && documentType !== "sales" && images.length === 0) {
      setImageError("At least one file is required");
      isValid = false;
    }

    return isValid;
  };
  // Helper function to determine which fields to show
  const getVisibleFields = () => {
    if (!documentType) {
      return 'default';
    }
    if (['purchase', 'expense'].includes(documentType)) {
      return 'basic';
    }
    if (documentType === 'sales') {
      return 'sales';
    }
    return 'basic'; // for 'legalDocuments' and 'otherDocuments'
  };

  return (
    <PrivateRoute isComponentLoading={isLoading}>
      <div className="bg-gray-100 min-h-screen pt-[80px] py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-4 sm:space-y-0">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {isEditMode ? "Edit Document" : "Add New Document"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Always show these fields */}
              <div className="mb-4">
                {/* Title Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Document Title <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={title}
                    onChange={handleInputChange}
                    className={`border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue ${titleError ? "border-red" : "border-gray-300"
                      }`}
                    required
                    disabled={isUploaded || isTitleLoading}
                  />
                  {titleError && <span className="text-red">{titleError}</span>}
                </div>

                {/* Description Field */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Document Description
                  </label>
                  <textarea
                    name="description"
                    value={description}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue"
                    rows="4"
                    disabled={isUploaded}
                  ></textarea>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Customer Select */}
                {role !== "66f4f8ee37fecad218d9fc69" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Customer <span className="text-red">*</span>
                    </label>
                    <select
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className={`border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue ${customerError ? "border-red" : "border-gray-300"
                        }`}
                      required
                      disabled={isUploaded}
                      value={selectedCustomerId}
                    >
                      <option value="">Select a customer</option>
                      {customers.map((customer) => (
                        <option key={customer._id} value={customer._id}>
                          {customer.companyLegalName}
                        </option>
                      ))}
                    </select>
                    {customerError && (
                      <span className="text-red">{customerError}</span>
                    )}
                  </div>
                )}

                {/* Document Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Document Type <span className="text-red">*</span>
                  </label>
                  <select
                    name="documentType"
                    onChange={handleInputChange}
                    className={`border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue ${documentTypeError ? "border-red" : "border-gray-300"
                      }`}
                    required
                    disabled={isUploaded}
                    value={documentType}
                  >
                    <option value="">Select Document Type</option>
                    <option value="sales">Sales Invoice</option>
                    <option value="purchase">Purchase Invoice</option>
                    <option value="expense">Expense</option>
                    <option value="legalDocuments">Legal Documents</option>
                    <option value="otherDocuments">Other Documents</option>
                  </select>
                  {documentTypeError && (
                    <span className="text-red">{documentTypeError}</span>
                  )}
                </div>

                {/* Payment Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Mode
                  </label>
                  <select
                    name="paymentMode"
                    onChange={handleInputChange}
                    className={`border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue`}
                    disabled={isUploaded}
                    value={paymentMode}
                  >
                    <option value="">Select Payment Mode</option>
                    <option value="cash">Cash</option>
                    <option value="credit">Credit</option>
                    <option value="bank">Bank</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Conditional Fields based on Document Type */}
              {documentType && (
                <>
                  {/* Sales Invoice Additional Fields */}
                  {getVisibleFields() === 'sales' && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Company Name
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          value={companyName}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded-lg p-3 w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Gross Amount
                        </label>
                        <input
                          type="number"
                          name="grossAmount"
                          value={grossAmount}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded-lg p-3 w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          VAT Total
                        </label>
                        <input
                          type="number"
                          name="vatTotal"
                          value={vatTotal}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded-lg p-3 w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Total Amount
                        </label>
                        <input
                          type="number"
                          name="totalAmount"
                          value={totalAmount}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded-lg p-3 w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Invoice Date
                        </label>
                        <input
                          type="date"
                          name="invoiceDate"
                          value={invoiceDate}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded-lg p-3 w-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* File Upload Section - Show for all document types except when none selected */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Invoice File {isEditMode ? "" : <span className="text-red">*</span>}
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className={`border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue ${imageError ? "border-red" : "border-gray-300"
                        }`}
                      accept="image/*,.pdf"
                      multiple
                    />
                    {imageError && <span className="text-red">{imageError}</span>}

                    {/* File Preview Table */}
                    {images.length > 0 && (
                      <table className="min-w-full bg-white shadow-sm rounded-lg text-sm mt-5">
                        <thead>
                          <tr
                            style={{
                              backgroundColor: tableHeadBgColor,
                              color: tableHeadTextColor,
                            }}
                          >
                            <th className="p-3 text-left border border-gray-300">No</th>
                            <th className="p-3 text-left border border-gray-300">Invoice</th>
                            <th className="p-3 text-left border border-gray-300">File Name</th>
                            <th className="p-3 text-left border border-gray-300">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {images.map((file, index) => (
                            <tr key={index}>
                              <td className="p-3 border border-gray-300">{index + 1}</td>
                              <td className="border border-gray-300 p-2">
                                {file.type.includes("image") ? (
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Uploaded file preview ${index + 1}`}
                                    className="w-20 h-20 object-cover"
                                  />
                                ) : file.type === "application/pdf" ? (
                                  <embed
                                    src={URL.createObjectURL(file)}
                                    type="application/pdf"
                                    className="w-20 h-20"
                                  />
                                ) : (
                                  <span className="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-lg text-gray-600">
                                    Unknown File
                                  </span>
                                )}
                              </td>
                              <td className="border border-gray-300 p-2">{file.name}</td>
                              <td className="border border-gray-300 p-2 text-center">
                                <button
                                  type="button"
                                  className="bg-red hover:bg-rose-950 text-white font-bold py-2 px-4 rounded items-center mx-auto flex justify-center"
                                  onClick={() => handleRemoveFile(index)}
                                >
                                  <FaTrashAlt />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}

              {/* Form Buttons */}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => navigate("/documents")}
                  className="bg-gray-500 text-white hover:opacity-90 px-6 py-2 rounded-lg"
                  disabled={isUploading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className={`bg-green text-white hover:opacity-90 px-6 py-2 rounded-lg ${isUploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  disabled={isUploading || isUploaded}
                >
                  {isUploading ? "Uploading..." : isEditMode ? "Update" : "Add Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="mb-24"></div>
      </div>
    </PrivateRoute>
  );
};

export default InvoiceForm;
