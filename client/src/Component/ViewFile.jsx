import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import {
  useGetInvoiceByIdQuery,
  useUpdateInvoiceByIdMutation,
} from "../api/invoiceApiSlice";
import PrivateRoute from "../utils/PrivateRoute.jsx";

const ViewFile = () => {
  const { documentId, invoiceId } = useParams();
  const {
    data: invoice,
    isLoading,
    error,
    refetch,
  } = useGetInvoiceByIdQuery(invoiceId);

  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [updateInvoice] = useUpdateInvoiceByIdMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [editableInvoice, setEditableInvoice] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (invoice) {
      setEditableInvoice(invoice);
    }
  }, [invoice]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading invoice</p>;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableInvoice((prevInvoice) => {
      const updatedInvoice = { ...prevInvoice, [name]: value };

      // Update totalAmount based on grossAmount and vatTotal
      if (name === "grossAmount" || name === "vatTotal") {
        updatedInvoice.totalAmount =
          parseFloat(updatedInvoice.grossAmount || 0) +
          parseFloat(updatedInvoice.vatTotal || 0);
      }

      return updatedInvoice;
    });
  };

  const handleEditClick = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    try {
      await updateInvoice({
        documentId,
        invoiceId,
        invoiceData: editableInvoice,
      }).unwrap();
      alert("Invoice updated successfully!");
      refetch();
      setIsEditing(false);
    } catch (error) {
      console.log("Failed to update invoice", error);
      alert("Failed to update invoice.");
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleModalOutsideClick = (e) => {
    if (e.target.className.includes("modal-overlay")) {
      closeModal();
    }
  };

  const data = [
    {
      field: "Invoice",
      value: (
        <a
          href={`${baseUrl}${invoice?.imageUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={`${baseUrl}${invoice?.imageUrl}`}
            alt="Invoice"
            className="w-20 h-auto border border-gray-300 shadow-md"
          />
        </a>
      ),
      name: "imageUrl",
    },
    {
      field: "TRN Number",
      value: editableInvoice?.trnNumber,
      name: "trnNumber",
    },
    {
      field: "Company Name",
      value: editableInvoice?.companyName,
      name: "companyName",
    },
    {
      field: "Invoice No.",
      value: editableInvoice?.invoiceNumber,
      name: "invoiceNumber",
    },
    {
      field: "Invoice Date",
      value: editableInvoice?.invoiceDate,
      name: "invoiceDate",
    },
    {
      field: "Gross Amount",
      value: editableInvoice?.grossAmount,
      name: "grossAmount",
    },
    {
      field: "VAT Amount",
      value: editableInvoice?.vatTotal,
      name: "vatTotal",
    },
    {
      field: "Total Amount",
      value: editableInvoice?.totalAmount,
      name: "totalAmount",
      isReadOnly: true,
    },
  ];

  return (
    <PrivateRoute isComponentLoading={isLoading}>
      <div className="bg-gray-100 min-h-screen pt-[80px] py-8">
        <div className="md:container md:mx-auto md:px-4">
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-2xl font-bold mb-4">
              Invoice: {editableInvoice?.invoiceNumber}
            </h1>
            <table className="min-w-full bg-white shadow-sm rounded-lg text-sm">
              <thead>
                <tr style={{ backgroundColor: "#206bc4", color: "white" }}>
                  {data.map((item, index) => (
                    <th
                      key={index}
                      className="p-3 text-left border border-gray-300"
                    >
                      {item.field}
                    </th>
                  ))}
                  <th className="p-3 text-left border border-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {data.map((item, index) => (
                    <td key={index} className="p-3 border border-gray-300">
                      {isEditing && !item.isReadOnly ? (
                        <input
                          type="text"
                          name={item.name}
                          value={item.value || ""}
                          onChange={handleInputChange}
                          className="border p-2 w-full"
                        />
                      ) : (
                        item.value
                      )}
                    </td>
                  ))}
                  <td className="p-3 border border-gray-300">
                    <button
                      onClick={handleEditClick}
                      className={`bg-blue text-white font-bold py-2 px-4 rounded ${
                        isEditing ? "hover:bg-green" : "hover:bg-blue-600"
                      }`}
                    >
                      {isEditing ? (
                        <>
                          <FaSave className="inline mr-2" /> Save
                        </>
                      ) : (
                        <>
                          <FaEdit className="inline mr-2" /> Edit
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="mb-24"></div>
      </div>
    </PrivateRoute>
  );
};

export default ViewFile;
