import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const ledgerData = new mongoose.Schema({
  ledgerName:{
    type:String
  },
  description:{
    type:String
  },
  createdBy: {
    type: ObjectId,
    ref: "Users",
  },
  updatedBy: {
    type: ObjectId,
    ref: "Users",
  },
},{
  timestamps: true,
}
);

const LedgerData = mongoose.model("ledgerData", ledgerData);

export default LedgerData;
