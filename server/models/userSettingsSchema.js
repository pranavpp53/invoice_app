import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  pagenationLimit: {
    type: Number,
    required: true,
  },
  chartType:{
    type:String,
    required:true
  },
  dateFormat:{
    type:String,
    required:true
  },
  timeFormat:{
    type:String,
    required:true
  },
  tableHeadBg:{
    type:String,
    required:true
  },
  tableHeadText:{
    type:String,
    required:true
  },
  tableStripped:{
    type:Boolean,
    default:true
  },
  tableHover:{
    type:Boolean,
    default:true
  },
  tableBorder:{
    type:Boolean,
    required:true
  },
  userId:{
    type:String,
    required:true
  }  
});

const UiSettings = mongoose.model("uiSettings", settingsSchema);

export default UiSettings;
