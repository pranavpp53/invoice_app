import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const documentSchema = new mongoose.Schema(
  {
    documentNumber: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    documentType: {
      type: String,
      required: true,
    },
    customerId: {
      type: ObjectId,
      ref: "Customer",
    },
    uploadedBy: {
      type: ObjectId,
      ref: "Users",
    },
    updatedBy: {
      type: ObjectId,
      ref: "Users",
    }
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;
