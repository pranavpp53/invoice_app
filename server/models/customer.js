import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema


const customerSchema = new mongoose.Schema({
    customerCode: {
        type: String,
        // required: true,
        unique: true,
    },
    companyLegalName: {
        type: String,
        required: true,
    },
    companyBrandName: {
        type: String,
        required: true,
    },
    address: {
        type: String,
    },
    phone: {
        type: String,
    },
    email: {
        type: String,
    },
    contactPersonal: {
        type: String,
    },
    contactPersonalPhone: {
        type: String,
    },
    contactPersonalEmail: {
        type: String,
    },
    website: {
        type: String,
    },
    plan: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'block']
    },
    createdBy: {
        type: String,
    },
    editedBy: {
        type: String,
    },
    userId: {
        type: ObjectId,
        ref: "Users",
    },
    userName: {
        type: String
    },

}, { timestamps: true });

const Customer = mongoose.model("Customer", customerSchema)

export default Customer;