import React, { useEffect, useState } from "react";
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import ErrorMessage from "../Component/ErrorComponent";
import { jwtDecode } from "jwt-decode";
import { useGetSettingsDataQuery } from "../api/settingsApiSlice.js";
import { useSelector } from "react-redux";

const TableWithPagination = ({
  headers,
  data,
  renderRow,
  currentPage,
  totalPages,
  onPageChange,
  isError,
  error,
  tableHeadBg = "#206bc4",
  tableHeadText = "white",
  itemsPerPage,
  contentTitle,
  checkboxValues = {},
  showPagination = true, // New prop to control pagination visibility
}) => {
  const token = useSelector((state) => state.auth.token);
  const [userId, setUserId] = useState("");
  const { data: settingsData } = useGetSettingsDataQuery({ id: userId });

  const tableHeadBgColor = settingsData?.settingsData?.tableHeadBg || "#206bc4";
  const tableHeadTextColor =
    settingsData?.settingsData?.tableHeadText || "white";
  const checkboxValuesFromSettings = settingsData?.settingsData;

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserId(decodedToken.userId);
    }
  }, [token]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg overflow-x-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {`${contentTitle} List`}
      </h3>

      {/* Table */}
      <div className="w-full table">
        {isError ? (
          <ErrorMessage
            message={error?.data?.message || "Error loading data"}
          />
        ) : (
          <>
            <table className="min-w-full bg-white shadow-sm rounded-lg text-sm">
              <thead>
                <tr
                  style={{
                    backgroundColor: tableHeadBgColor,
                    color: tableHeadTextColor,
                  }}
                >
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      className={`p-3 text-left ${
                        checkboxValuesFromSettings?.tableBorder
                          ? "border border-gray-300"
                          : ""
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((item, index) => renderRow(item, index))
                ) : (
                  <tr>
                    <td
                      colSpan={headers.length}
                      className="text-red text-center p-3"
                    >
                      No data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Conditionally render pagination */}
            {showPagination && (
              <div className="flex justify-end items-center mt-6">
                <div className="flex items-center border rounded-lg space-x-1 sm:space-x-3 h-8 sm:h-12 px-2 sm:px-4">
                  <button
                    className={`text-blue hover:text-indigo transition duration-200 ease-in-out ${
                      currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    aria-label="Go to first page"
                  >
                    <ChevronsLeft size={14} />
                  </button>
                  <button
                    className={`text-blue hover:text-indigo transition duration-200 ease-in-out ${
                      currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Go to previous page"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-blue text-sm md:text-xl font-semibold px-1 sm:px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    className={`text-blue hover:text-indigo transition duration-200 ease-in-out ${
                      currentPage === totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Go to next page"
                  >
                    <ChevronRight size={14} />
                  </button>
                  <button
                    className={`text-blue hover:text-indigo transition duration-200 ease-in-out ${
                      currentPage === totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    aria-label="Go to last page"
                  >
                    <ChevronsRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TableWithPagination;
