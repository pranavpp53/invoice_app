import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import {
  useApplynewsettingsMutation,
  useGetSettingsDataQuery,
} from "../api/settingsApiSlice.js";

// Custom Alert component
const Alert = ({ message, type }) => (
  <div
    className={`p-4 mb-4 rounded-md ${
      type === "success"
        ? "border-green border-2 text-center text-green font-bold"
        : "border-red border-2 text-red"
    }`}
  >
    {message}
  </div>
);

const Settings = () => {
  const token = useSelector((state) => state.auth.token);
  const [user, setUserId] = useState("");
  const [applynewsettings, { isLoading }] = useApplynewsettingsMutation();
  const [alertMessage, setAlertMessage] = useState(null);

  const { currentData, refetch } = useGetSettingsDataQuery({ id: user });

  const initialSettings = {
    pagenationLimit: 5,
    chartType: "Bar",
    dateFormat: "yyyy-MM-dd",
    timeFormat: "HH:mm:ss",
    tableHeadBg: "#206bc4",
    tableHeadText: "#FFFFFF",
    tableStripped: true,
    tableHover: true,
    tableBorder: true,
  };

  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserId(decodedToken.userId);
    }
  }, [token]);

  useEffect(() => {
    if (currentData?.settingsData) {
      setSettings(prevSettings => ({
        ...prevSettings,
        ...currentData.settingsData,
        tableStripped: currentData.settingsData.tableStripped === true || currentData.settingsData.tableStripped === "true",
        tableHover: currentData.settingsData.tableHover === true || currentData.settingsData.tableHover === "true",
        tableBorder: currentData.settingsData.tableBorder === true || currentData.settingsData.tableBorder === "true",
      }));
    }
  }, [currentData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await applynewsettings({
        id: user,
        settingsValue: settings,
      }).unwrap();
      setAlertMessage({ type: "success", message: result.message });
      refetch();
    } catch (error) {
      setAlertMessage({
        type: "error",
        message: error.message || "An error occurred while updating settings.",
      });
    }
  };

  const handleReset = () => {
    setSettings(initialSettings);
    setAlertMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#EEF4F7] p-4 pt-[80px]">
      <div className="mx-auto w-[79%]  ">
        <h2 className="text-3xl sm:text-2xl  mb-6 ">User settings</h2>

        {alertMessage && (
          <Alert message={alertMessage.message} type={alertMessage.type} />
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-8 rounded-lg shadow-md  "
        >
          <div className="grid grid-cols-1 gap-6 sm:gap-8 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray mb-1">
                Pagination Limit <span className="text-red">*</span>
              </label>
              <input
                type="number"
                name="pagenationLimit"
                value={settings.pagenationLimit}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-2 shadow-sm  py-2 pl-5 focus:outline-none"
                placeholder="20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Format <span className="text-red">*</span>
              </label>
              <select
                name="dateFormat"
                value={settings.dateFormat}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-2 shadow-sm  py-2 pl-5 focus:outline-none"
              >
                <option>yyyy-MM-dd</option>
                <option>dd-MM-yyyy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Format <span className="text-red">*</span>
              </label>
              <select
                name="timeFormat"
                value={settings.timeFormat}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-2 shadow-sm  py-2 pl-5 focus:outline-none"
              >
                <option>HH:mm:ss</option>
                <option>ss:mm:HH</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Table head bg <span className="text-red">*</span>
              </label>
              <input
                type="color"
                name="tableHeadBg"
                value={settings.tableHeadBg}
                onChange={handleInputChange}
                className="mt-1 block w-full h-5 rounded-md border shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray mb-1">
                Table head text <span className="text-red">*</span>
              </label>
              <input
                type="color"
                name="tableHeadText"
                value={settings.tableHeadText}
                onChange={handleInputChange}
                className="mt-1 block w-full h-5 rounded-md border shadow-sm"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-between items-center space-x-6 w-full">
            <div className="flex flex-col items-center flex-1">
              <label
                htmlFor="tableStripped"
                className="block text-sm text-gray-900 mb-2"
              >
                Table striped <span className="text-red">*</span>
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="tableStripped"
                  checked={settings.tableStripped}
                  onChange={handleInputChange}
                  className="sr-only peer"
                  id="tableStripped"
                />
                <div className="w-12 h-5 bg-red rounded-full peer-checked:bg-green transition-colors"></div>
                <div className="absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-transform transform peer-checked:translate-x-6"></div>
              </label>
            </div>

            <div className="flex flex-col items-center flex-1">
              <label
                htmlFor="tableHover"
                className="block text-sm text-gray-900 mb-2"
              >
                Table hover <span className="text-red">*</span>
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="tableHover"
                  checked={settings.tableHover}
                  onChange={handleInputChange}
                  className="sr-only peer"
                  id="tableHover"
                />
                <div className="w-12 h-5 bg-red rounded-full peer-checked:bg-green transition-colors"></div>
                <div className="absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-transform transform peer-checked:translate-x-6"></div>
              </label>
            </div>

            <div className="flex flex-col items-center flex-1">
              <label
                htmlFor="tableBorder"
                className="block text-sm text-gray-900 mb-2"
              >
                Table border <span className="text-red">*</span>
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="tableBorder"
                  checked={settings.tableBorder}
                  onChange={handleInputChange}
                  className="sr-only peer"
                  id="tableBorder"
                />
                <div className="w-12 h-5 bg-red rounded-full peer-checked:bg-green transition-colors"></div>
                <div className="absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-transform transform peer-checked:translate-x-6"></div>
              </label>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-2/4 px-6 py-3 bg-red text-white rounded-md hover:bg-red-dark focus:outline-none focus:ring-2 focus:ring-red focus:ring-opacity-50"
            >
              RESET ALL
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-2/4 px-6 py-3 bg-green text-white rounded-md hover:bg-green-dark focus:outline-none focus:ring-2 focus:ring-green focus:ring-opacity-50"
            >
              {isLoading ? "Saving..." : "SAVE"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;