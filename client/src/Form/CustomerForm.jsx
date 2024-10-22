import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  useFetchPlanOptionsQuery,
  useGetUniqueCustomerCodeQuery,
} from "../api/customersApiSlice.js";

const CustomerForm = ({
  isOpen,
  onClose,
  onSubmit,
  customerData,
  isEditing,
  formData,
  setFormData,
}) => {
  const currentUser = useSelector((state) => state.auth.user?.userName);
  const { data: customerCodeData, isLoading: isCustomerCodeLoading } =
    useGetUniqueCustomerCodeQuery(null, {
      skip: isEditing,
    });

  const modalRef = useRef();

  const [validationErrors, setValidationErrors] = useState({});
  const [error, setError] = useState("");
  const [backendError, setBackendError] = useState("");
  // const [successMessage, setSuccessMessage] = useState("");
  const { data, isLoading: isPlanLoading } = useFetchPlanOptionsQuery();

  const planOptions = data?.planValues || [];

  // Initialize form data for editing or new customers
  useEffect(() => {
    if (isOpen) {
      if (isEditing && customerData) {
        // Populate form with existing customer data in Edit mode
        setFormData({
          customerCode: customerData.customerCode || "",
          companyLegalName: customerData.companyLegalName || "",
          companyBrandName: customerData.companyBrandName || "",
          userName: customerData.userName || "",
          password: "",
          address: customerData.address || "",
          phone: customerData.phone || "",
          email: customerData.email || "",
          contactPersonal: customerData.contactPersonal || "",
          contactPersonalPhone: customerData.contactPersonalPhone || "",
          contactPersonalEmail: customerData.contactPersonalEmail || "",
          website: customerData.website || "",
          plan: customerData.plan || "",
          status: customerData.status || "",
          createdAt: customerData.createdAt || new Date().toISOString(),
          createdBy: customerData.createdBy || currentUser,
          editedAt: new Date().toISOString(),
          editedBy: currentUser,
          _id: customerData._id || "",
        });
      } else if (!isEditing && !formData._id) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          customerCode: customerCodeData || "",
          createdAt: new Date().toISOString(),
          createdBy: currentUser,
          editedAt: new Date().toISOString(),
          editedBy: currentUser,
          _id: "",
        }));
      }
    }
  }, [
    isEditing,
    customerData,
    customerCodeData,
    currentUser,
    isOpen,
    formData._id,
  ]);

  // Handle input changes and persist form data
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value || "",
    }));
  };

  // Form submission
  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trim all form data
    const trimmedFormData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ])
    );

    // Validate fields
    const requiredFields = [
      "companyLegalName",
      "companyBrandName",
      "userName",
      "phone",
      "email",
      "plan",
      "status",
    ];

    const validationErrors = {};
    requiredFields.forEach((field) => {
      if (!trimmedFormData[field]) {
        validationErrors[field] = `${field} is required.`;
      }
    });

    // Check for validation errors
    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors(validationErrors);
      return;
    }

    // Reset validation errors if submission is valid
    setValidationErrors({});

    const submitData = { ...trimmedFormData };

    if (isEditing && !submitData.password) {
      delete submitData.password;
    }

    try {
      const response = await onSubmit(submitData);
      // setSuccessMessage("Customer data saved successfully!");
      setError("");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      setBackendError(
        error?.data?.message || "Failed to save or update customer"
      );
      setError("An error occurred while saving customer data.");
      setTimeout(() => setError(""), 5000);
    }
  };

  const closeModalWithoutSave = () => {
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModalWithoutSave();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center pt-10">
      <div
        className="bg-white pt-3 rounded-lg shadow-lg max-w-3xl w-full h-5/6 flex flex-col"
        ref={modalRef}
      >
        <div className="bg-white p-3 rounded-t-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {isEditing ? "Edit Customer" : "Add New Customer"}
            </h2>
            <button
              onClick={closeModalWithoutSave}
              className="text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
          </div>
        </div>

        <hr className="border-t border-gray-300" />

        <div className="bg-gray-100 p-4 rounded-b-lg flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red text-red p-3 rounded-lg">{error}</div>
            )}
            {/* {successMessage && (
              <div className="bg-green text-green p-3 rounded-lg">
                {successMessage}
              </div>
            )} */}
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 ">
                  Customer Code <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  name="customerCode"
                  value={
                    isEditing
                      ? formData?.customerCode
                      : isCustomerCodeLoading
                      ? "Loading..."
                      : customerCodeData || ""
                  }
                  readOnly
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue"
                  placeholder="Customer Code"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Company Legal Name <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  name="companyLegalName"
                  value={formData?.companyLegalName}
                  onChange={handleChange}
                  className={`border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue ${
                    validationErrors.companyLegalName ? "border-red" : ""
                  }`}
                  placeholder="Enter Company Legal Name"
                  autocomplete="off"
                  required
                />
                {validationErrors.companyLegalName && (
                  <div className="text-red">
                    {validationErrors.companyLegalName}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Company Brand Name <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  name="companyBrandName"
                  value={formData?.companyBrandName}
                  onChange={handleChange}
                  autocomplete="off"
                  className={`border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue ${
                    validationErrors.companyBrandName ? "border-red" : ""
                  }`}
                  placeholder="Enter Company Brand Name"
                  required
                />
                {validationErrors.companyBrandName && (
                  <div className="text-red">
                    {validationErrors.companyBrandName}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Username <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  name="userName"
                  value={formData?.userName}
                  onChange={handleChange}
                  autocomplete="off"
                  className={`border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue ${
                    validationErrors.userName ? "border-red" : ""
                  }`}
                  placeholder="Enter Username"
                  required
                />
                {validationErrors.userName && (
                  <div className="text-red">{validationErrors.userName}</div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password{" "}
                  {isEditing ? null : <span className="text-red">*</span>}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData?.password}
                  onChange={handleChange}
                  autoComplete="off"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue"
                  placeholder={
                    isEditing
                      ? "Enter new password (optional)"
                      : "Enter password"
                  }
                  required={!isEditing}
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData?.address}
                  onChange={handleChange}
                  autoComplete="off"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue"
                  placeholder="Enter Address"
                />
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Phone <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData?.phone}
                  onChange={handleChange}
                  autoComplete="off"
                  required
                  className={`border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue ${
                    validationErrors.phone ? "border-red" : ""
                  }`}
                  placeholder="Enter Phone"
                />
                {validationErrors.phone && (
                  <div className="text-red">{validationErrors.phone}</div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Email <span className="text-red">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData?.email}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                  className={`border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue ${
                    validationErrors.email ? "border-red" : ""
                  }`}
                  placeholder="Enter Email"
                />
                {validationErrors.email && (
                  <div className="text-red">{validationErrors.email}</div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Contact Person
                </label>
                <input
                  type="text"
                  name="contactPersonal"
                  value={formData.contactPersonal}
                  onChange={handleChange}
                  autoComplete="off"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue"
                  placeholder="Contact Person"
                />
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Contact Person Phone
                </label>
                <input
                  type="text"
                  name="contactPersonalPhone"
                  value={formData?.contactPersonalPhone}
                  onChange={handleChange}
                  autoComplete="off"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue"
                  placeholder="Contact Person Phone"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Contact Person Email
                </label>
                <input
                  type="email"
                  name="contactPersonalEmail"
                  value={formData?.contactPersonalEmail}
                  onChange={handleChange}
                  autoComplete="off"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue"
                  placeholder="Contact Person Email"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="text"
                  name="website"
                  value={formData?.website}
                  onChange={handleChange}
                  autoComplete="off"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue"
                  placeholder="Enter Website"
                />
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Plan <span className="text-red">*</span>
                </label>
                <select
                  name="plan"
                  value={formData?.plan}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue z-10"
                  required
                >
                  <option value="">Select a Plan</option>
                  {isPlanLoading ? (
                    <option>Loading...</option>
                  ) : (
                    planOptions.map((plan) => (
                      <option key={plan} value={plan}>
                        {plan.charAt(0).toUpperCase() + plan.slice(1)}{" "}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Status <span className="text-red">*</span>
                </label>
                <select
                  name="status"
                  value={formData?.status}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="block">Block</option>
                </select>
              </div>
              {backendError && (
                  <span className="text-red">{backendError}</span>
                )}
            </div>
            <input type="hidden" name="createdAt" value={formData?.createdAt} />
            <input type="hidden" name="createdBy" value={formData?.createdBy} />
            <input type="hidden" name="editedAt" value={formData?.editedAt} />
            <input type="hidden" name="editedBy" value={formData?.editedBy} />
            <input type="hidden" name="_id" value={formData?._id} />{" "}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={closeModalWithoutSave}
                className="bg-red text-white hover:opacity-90 px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green text-white hover:opacity-90 px-6 py-2 rounded-lg"
              >
                {isEditing ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;
