import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  permissions: {
    subUser: {
      view: {
        type: Boolean,
        default: false,
      },
      create: {
        type: Boolean,
        default: false,
      },
      edit: {
        type: Boolean,
        default: false,
      },
      delete: {
        type: Boolean,
        default: false,
      },
    },
    roles: {
      view: {
        type: Boolean,
        default: false,
      },
      create: {
        type: Boolean,
        default: false,
      },
      edit: {
        type: Boolean,
        default: false,
      },
      delete: {
        type: Boolean,
        default: false,
      },
    },
    customer: {
      view: {
        type: Boolean,
        default: false,
      },
      create: {
        type: Boolean,
        default: false,
      },
      edit: {
        type: Boolean,
        default: false,
      },
      delete: {
        type: Boolean,
        default: false,
      },
    },
    documents: {
      view: {
        type: Boolean,
        default: false,
      },
      create: {
        type: Boolean,
        default: false,
      },
      edit: {
        type: Boolean,
        default: false,
      },
      delete: {
        type: Boolean,
        default: false,
      },
    },
    documentStatus: {
      view: {
        type: Boolean,
        default: false,
      },
      create: {
        type: Boolean,
        default: false,
      },
      edit: {
        type: Boolean,
        default: false,
      },
      delete: {
        type: Boolean,
        default: false,
      },
    },
    ledger: {
      view: {
        type: Boolean,
        default: false,
      },
      create: {
        type: Boolean,
        default: false,
      },
      edit: {
        type: Boolean,
        default: false,
      },
      delete: {
        type: Boolean,
        default: false,
      },
    },
  },
});

const Role = mongoose.model("Role", roleSchema);

export default Role;
