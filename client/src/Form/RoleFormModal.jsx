import { useState, useEffect, useRef } from "react";
import { useAddRoleMutation } from "../api/roleApiSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setLogout } from "../auth/authSlice";

const RoleFormModal = ({ closeModal, onSuccess, closeModelWithoutSave, formData, setFormData }) => {
  const [addRole] = useAddRoleMutation();
  const [validationErrors, setValidationErrors] = useState({});
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const modalRef = useRef(null); // Reference for modal content

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    if (type === "checkbox") {
      const [menu, accessType] = name.split(".");

      setFormData((prev) => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [menu]: {
            ...prev.permissions[menu],
            [accessType]: checked,
          },
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateFields = () => {
    const trimmedData = {
      roleName: formData?.roleName.trim(),
      description: formData?.description.trim(),
    };

    let errors = {};

    if (!trimmedData.roleName) {
      errors.roleName = "Role name is required.";
    }

    if (trimmedData?.description.length > 200) {
      errors.description = "Description cannot exceed 200 characters.";
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
      await addRole(formData).unwrap();
      setSuccessMessage("Role added successfully!");
      setError("");
      setValidationErrors({});
      if (onSuccess) onSuccess();
      closeModal();
    } catch (error) {
      if (error.status === 401) {
        dispatch(setLogout());
        navigate("/login");
        return;
      }
      setError(error.data?.error || "Failed to add role.");
    }
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeModelWithoutSave();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center pt-10">
      <div
        ref={modalRef}
        className="bg-white pt-3 rounded-lg shadow-lg max-w-3xl w-full h-5/6 flex flex-col"
      >
        <div className="bg-white p-3 rounded-t-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Add New Role</h2>
            <button
              onClick={closeModelWithoutSave}
              className="text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
          </div>
        </div>

        <hr className="border-t border-gray-300" />

        <div className="bg-gray-100 p-4 rounded-b-lg flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display error message if it exists */}
            {error && (
              <div className="bg-red-100 text-red p-3 rounded-lg">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-100 text-green p-3 rounded-lg">
                {successMessage}
              </div>
            )}

            <div className="flex justify-between space-x-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Role name <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  name="roleName"
                  value={formData?.roleName}
                  autoComplete="off"
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue"
                  placeholder="Enter Role Name"
                  required
                />
                {validationErrors.roleName && (
                  <div className="text-red text-sm mt-1">
                    {validationErrors.roleName}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData?.description}
                  onChange={handleChange}
                  autoComplete="off"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue"
                  placeholder="Enter Description"
                />
                {validationErrors.description && (
                  <div className="text-red text-sm mt-1">
                    {validationErrors.description}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Set permissions
              </h3>
              <table className="min-w-full border-collapse bg-white shadow-sm rounded-lg text-sm">
                <thead>
                  <tr className="bg-blue text-white">
                    <th className="border border-gray-300 p-3 text-left">NO</th>
                    <th className="border border-gray-300 p-3 text-left">
                      MENU NAME
                    </th>
                    <th className="border border-gray-300 p-3 text-left">
                      VIEW
                    </th>
                    <th className="border border-gray-300 p-3 text-left">
                      CREATE
                    </th>
                    <th className="border border-gray-300 p-3 text-left">
                      EDIT
                    </th>
                    <th className="border border-gray-300 p-3 text-left">
                      DELETE
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(formData?.permissions).map((menu, index) => (
                    <tr className="hover:bg-gray-50" key={menu}>
                      <td className="border border-gray-300 p-3 text-center">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 p-3">{menu}</td>
                      {["view", "create", "edit", "delete"].map(
                        (accessType) => (
                          <td
                            className="border border-gray-300 p-3 text-center"
                            key={accessType}
                          >
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                name={`${menu}.${accessType}`}
                                checked={formData?.permissions[menu][accessType]}
                                onChange={handleChange}
                                className="sr-only peer"
                              />
                              <div className="w-12 h-5 bg-red rounded-full peer-checked:bg-green transition-colors"></div>
                              <div className="absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-transform transform peer-checked:translate-x-6"></div>
                            </label>
                          </td>
                        )
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end space-x-2 mt-4 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={closeModelWithoutSave}
                className="bg-red text-white hover:opacity-90 px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green text-white hover:opacity-90 px-6 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoleFormModal;
