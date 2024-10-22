import React, { useState, useEffect } from "react";
import { useGetAllLedgersQuery } from "../api/ledgerApiSlice";
import TableWithPagination from "../assets/TableWithPagination";
import Search from "../assets/Search";
import PrivateRoute from "../utils/PrivateRoute.jsx";
import LedgerForm from "../Form/LedgerForm.jsx";
import { useGetAllSubUsersQuery } from "../api/userApiSlice";
import {
  useEditLedgerMutation,
  useDeleteLedgerMutation,
} from "../api/ledgerApiSlice";
import { FaTrashAlt, FaEdit } from "react-icons/fa";

const Ledger = () => {
  const {
    data: ledgersData = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAllLedgersQuery();

  const { data: usersData = [], isLoading: isUserLoading } =
    useGetAllSubUsersQuery();

  const [filteredLedgers, setFilteredLedgers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editLedgerId, setEditLedgerId] = useState(null);
  const [formData, setFormData] = useState({
    ledgerName: "",
    description: "",
  });

  const [deleteLedger] = useDeleteLedgerMutation();

  useEffect(() => {
    if (ledgersData) {
      const updatedLedgers = ledgersData.filter((ledger) =>
        ledger.ledgerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLedgers(updatedLedgers);
    }
  }, [ledgersData, searchTerm]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleEditClick = (ledger) => {
    setFormData({
      ledgerName: ledger.ledgerName,
      description: ledger.description,
    });
    setIsEdit(true);
    setEditLedgerId(ledger._id);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (ledgerId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this ledger?"
    );
    if (confirmed) {
      try {
        await deleteLedger(ledgerId).unwrap();
        refetch();
      } catch (error) {
        alert("Failed to delete ledger");
      }
    }
  };

  const renderRow = (ledger, index) => {
    const createdByUser = usersData.find(
      (user) => user._id === ledger.createdBy
    );
    const userId = createdByUser ? createdByUser.userId : "Unknown";

    return (
      <tr key={ledger._id} className="even:bg-white odd:bg-gray-50">
        <td className="p-3 border border-gray-300">{index + 1}</td>
        <td className="p-3 border border-gray-300">{ledger.ledgerName}</td>
        <td className="p-3 border border-gray-300">{ledger.description}</td>
        <td className="p-3 border border-gray-300">{userId}</td>
        <td className="p-3 border border-gray-300">
          {new Date(ledger.createdAt).toLocaleDateString()}
        </td>
        <td className="p-3 border border-gray-300">
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => handleEditClick(ledger)}
              className="bg-yellow hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => handleDeleteClick(ledger._id)}
              className=" bg-red hover:bg-rose-950 text-white font-bold py-2 px-4 rounded items-center"
            >
              <FaTrashAlt />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const handleAddNewClick = () => {
    setFormData({ ledgerName: "", description: "" });
    setIsEdit(false);
    setIsModalOpen(true);
  };

  const onSuccess = () => {
    refetch();
    setIsModalOpen(false);
  };

  return (
    <PrivateRoute isComponentLoading={isLoading}>
      <div className="bg-gray-100 min-h-screen pt-[80px] py-8">
        <div className="md:container md:mx-auto md:px-4">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-row justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 text-center sm:text-left">
                Ledger
              </h2>
              <button
                onClick={handleAddNewClick}
                className="bg-blue text-white hover:bg-blue rounded-lg px-4 py-1 text-xs sm:text-base sm:px-6 sm:py-2"
              >
                + Add New
              </button>
            </div>

            {/* Search Component */}
            <Search
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              placeholder="Search by ledger name..."
            />

            {/* Ledger Table */}
            {isLoading && <p>Loading ledgers...</p>}
            {isError && <p>Error: {error.message}</p>}

            {!isLoading && !isError && (
              <TableWithPagination
                headers={[
                  "No",
                  "Ledger Name",
                  "Description",
                  "Created By",
                  "Created At",
                  "Actions",
                ]}
                data={filteredLedgers}
                renderRow={renderRow}
                currentPage={1}
                totalPages={1}
                contentTitle="Ledger"
              />
            )}

            {/* Ledger Form Modal */}
            <LedgerForm
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              formData={formData}
              setFormData={setFormData}
              onSuccess={onSuccess}
              isEdit={isEdit}
              editLedgerId={editLedgerId}
            />
          </div>
        </div>
        <div className="mb-24"></div>
      </div>
    </PrivateRoute>
  );
};

export default Ledger;
