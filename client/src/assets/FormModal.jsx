import { useState } from "react";

function FormModal({ isOpen, onClose, onSubmit, title, fields }) {
  const [formData, setFormData] = useState({});

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
    setFormData({});
    onClose();
  };

  return (
    <div
      className={`fixed z-10 inset-0 overflow-y-auto ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-md text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:flex-wrap">
                {fields.map((field, index) => (
                  <div key={index} className="w-full sm:w-1/2 p-2">
                    {" "}
                    {/* Add padding */}
                    <div>
                      <label
                        htmlFor={field.name}
                        className="block text-sm font-medium text-gray-700"
                      >
                        {field.label}
                        {field.required && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <input
                        type={field.type}
                        name={field.name}
                        id={field.name}
                        className="mt-1 block w-full shadow-md sm:text-md border-gray-300 rounded-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-gray-300"
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        required={field.required}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Save
              </button>
              <button
                onClick={onClose}
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FormModal;
