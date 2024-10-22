import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const invoiceData = new mongoose.Schema({
  documentId: {
    type: ObjectId,
      ref: "Document",
  },
  invoiceNumber: {
    type: String,
  },
  trnNumber: {
    type: String,
  },
  totalAmount: {
    type: String,
  },
  vatTotal: {
    type: String,
  },
  companyName: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  invoiceDate:{
    type:String
  },
  grossAmount:{
    type:String
  },
  billType:{
    type:String
  },
  billStatus: {
    type: String,
    enum: ['pending', 'reviewed', 'approved'],
    default: 'pending'
  },
  ledger: {
    type: String,
    default: 'not selected',
  },
  StatusUpdatedBy: {
    type: ObjectId,
    ref: "Users",
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'credit', 'bank','other'],
    default: 'other'
  },
  duplicateStatus: {
    type: Boolean,
    default: false,
  },
  customerId: {
    type: String
    },
},{
  timestamps: true,
}
);

const InvoiceData = mongoose.model("InvoiceData", invoiceData);

export default InvoiceData;
