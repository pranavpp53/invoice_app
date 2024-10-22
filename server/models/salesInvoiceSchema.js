import mongoose from "mongoose";

const salesInvoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    TRNnumber: {
        type: String,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    VATtotal: {
        type: Number,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerAddress: {
        type: String
    },
    invoiceDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    dueDate: {
        type: Date
    },
    items: [{
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        quantity: {
            type: Number,
            required: true
        },
        unitPrice: {
            type: Number,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        }
    }],
    paymentTerms: {
        type: String
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Unpaid', 'Partial', 'Overdue'],
        default: 'Unpaid'
    },
    notes: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const SalesInvoice = mongoose.model("SalesInvoice", salesInvoiceSchema);

export default SalesInvoice;