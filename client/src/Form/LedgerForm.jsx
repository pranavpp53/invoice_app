import { useState, useEffect, useRef } from "react";
import {
  useCreateLedgerMutation,
  useEditLedgerMutation,
} from "../api/ledgerApiSlice";
import { useDispatch } from "react-redux";
import { setLogout } from "../auth/authSlice";
import { useNavigate } from "react-router-dom";

const LedgerForm = ({
  isOpen,
  onClose,
  onSuccess,
  formData,
  setFormData,
  isEdit,
  editLedgerId,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const modalRef = useRef();

  const [validationErrors, setValidationErrors] = useState("");
  const [addLedger] = useCreateLedgerMutation();
  const [editLedger] = useEditLedgerMutation();

  useEffect(() => {
    if (isOpen) {
      setFormData((prevData) => ({
        ...prevData,
        ledgerName: prevData?.ledgerName || "",
        description: prevData?.description || "",
      }));
    }
  }, [isOpen, setFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    // Trim the input values
    const trimmedData = {
      ledgerName: formData?.ledgerName.trim(),
      description: formData?.description.trim(),
    };

    // Validate all fields
    if (!trimmedData?.ledgerName)
      errors.ledgerName = "Ledger Name is required.";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      if (isEdit) {
        await editLedger({
          id: editLedgerId,
          ledgerData: trimmedData,
        }).unwrap();
        alert("Ledger updated successfully!");
      } else {
        await addLedger(trimmedData).unwrap();
        alert("Ledger added successfully!");
      }

      setFormData({
        ledgerName: "",
        description: "",
      });
      setValidationErrors({});
      onClose();
      onSuccess();
    } catch (error) {
      if (error.status === 401) {
        dispatch(setLogout());
        navigate("/login");
        return;
      }
      alert(error.data?.error || "Failed to submit ledger");
    }
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 pt-10">
      <div
        className="bg-white pt-3 rounded-lg shadow-lg max-w-3xl w-full md:w-4/6 lg:w-2/3 xl:w-1/2 h-full md:h-4/6 flex flex-col"
        ref={modalRef}
      >
        {/* Title Section */}
        <div className="bg-white p-3 rounded-t-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {isEdit ? "Edit Ledger" : "Add New Ledger"}
            </h2>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {validationErrors && (
              <div className="text-red mb-4">{validationErrors}</div>
            )}

            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700">
                  Ledger Name <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  name="ledgerName"
                  value={formData?.ledgerName}
                  onChange={handleChange}
                  autoComplete="off"
                  placeholder="Enter ledger name"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue"
                  required
                />
                {validationErrors.ledgerName && (
                  <div className="text-red text-sm">
                    {validationErrors.ledgerName}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData?.description}
                  onChange={handleChange}
                  autoComplete="off"
                  placeholder="Enter description"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue"
                />
                {validationErrors.description && (
                  <div className="text-red text-sm">
                    {validationErrors.description}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
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
                {isEdit ? "Update Ledger" : "Add Ledger"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LedgerForm;
