import React from "react";

const Pagination = ({ currentPage, totalPages, handlePageChange }) => {
  return (
    <div className="flex justify-end items-center mt-4">
      <div
        className="flex items-center border rounded-lg space-x-2 sm:space-x-3"
        style={{ height: "3rem" }}
      >
        <button
          className={`text-blue hover:text-indigo p-0 transition duration-200 ease-in-out ${
            currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            fontSize: "2.5rem",
            padding: "0.25rem 0.5rem",
            margin: "0",
          }}
        >
          «
        </button>
        <span
          className="text-blue text-lg sm:text-xl font-semibold"
          style={{
            fontSize: "1.2rem",
            padding: "0.25rem 0.5rem",
            margin: "0",
            marginTop: "0.5rem",
          }}
        >
          {currentPage} / {totalPages}
        </span>
        <button
          className={`text-blue hover:text-indigo transition duration-200 ease-in-out p-0 ${
            currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            fontSize: "2.5rem",
            padding: "0.25rem 0.5rem",
            margin: "0",
          }}
        >
          »
        </button>
      </div>
    </div>
  );
};

export default Pagination;
