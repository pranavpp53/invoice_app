import Customer from "../models/customer.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwtToken.js";
import Users from "../models/user.js";

const generateCustomerCode = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed
  return `CUS${year}${month}`;
};

let lastUsedNumber = 0;

export const getUniqueCustomerCode = async (req, res) => {
  let customerCode;
  let existingCustomer;
  do {
    const baseCode = generateCustomerCode();
    lastUsedNumber = (lastUsedNumber + 1) % 10000; // Ensures it stays within 4 digits
    const consecutiveNumber = lastUsedNumber.toString().padStart(4, "0");
    customerCode = `${baseCode}${consecutiveNumber}`;
    existingCustomer = await Customer.findOne({ customerCode });
  } while (existingCustomer);

  return res.status(200).json(customerCode);
};

//plans variable
const planValues = ["basic", "standard", "premium"];

//add customer
export const addCustomer = async (req, res) => {
  const {
    customerCode,
    companyLegalName,
    companyBrandName,
    userName,
    password,
    address,
    phone,
    email,
    contactPersonal,
    contactPersonalPhone,
    contactPersonalEmail,
    website,
    plan,
    status,
    createdBy,
  } = req.body;
  const roleId = '66f4f8ee37fecad218d9fc69';

  try {
    // Check if user with the same userName already exists
    const existingUser = await Users.findOne({ userId: userName });
    const existingcompanyLegalName = await Customer.findOne({companyLegalName})
    const existingcompanyBrandName = await Customer.findOne({companyBrandName})

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "username should be UNIQE ! ......... try another username" });
    }
    if (existingcompanyLegalName) {
      return res
        .status(400)
        .json({ error: "company legal name already exist for another company" });
    }
    if (existingcompanyBrandName) {
      return res
        .status(400)
        .json({ error: "company Brand name already exist for another company" });
    }

    // Check if the customerCode is unique
    const existingCode = await Customer.findOne({ customerCode });
    if (existingCode) {
      return res
        .status(400)
        .json({
          error: "Customer code already exists. Please generate a new one.",
        });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create and save the new user
    const newUser = new Users({
      userName: companyLegalName,
      phoneNo: phone,
      email: email,
      userId: userName,
      password: hashedPassword,
      userRole: roleId
    });

    const savedUser = await newUser.save();

    // Create a new customer with reference to the user
    const newCustomer = new Customer({
      customerCode,
      companyLegalName,
      companyBrandName,
      address,
      phone,
      email,
      contactPersonal,
      contactPersonalPhone,
      contactPersonalEmail,
      website,
      plan,
      status,
      createdBy,
      userName,
      userId: savedUser._id  // Reference to the Users schema
    });

    // Save the new customer to the database
    await newCustomer.save();

    // Create a response object without sensitive information
    const responseObject = {
      ...newCustomer.toObject(),
      userName: savedUser.userName,
      phone: savedUser.phoneNo,
      email: savedUser.email
    };

    delete responseObject.userId;  // Remove the userId reference from the response

    res.status(201).json({
      message: "New customer successfully created",
      customer: responseObject,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error creating customer", details: error.message });
  }
};

//edit customer
export const editCustomer = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Find the customer by customerId
    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // List of fields that can be updated
    const updatableFields = [
      "companyLegalName",
      "companyBrandName",
      "userName",
      "password",
      "address",
      "phone",
      "email",
      "contactPersonal",
      "contactPersonalPhone",
      "contactPersonalEmail",
      "website",
      "plan",
      "status",
      "editedBy",
    ];

    // Update only the fields that are provided and allowed to be updated
    updatableFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        customer[field] = updateData[field];
      }
    });

    // Update the editedAt and editedBy fields
    customer.editedAt = new Date().toISOString();

    // Save the updated customer
    await customer.save();

    res
      .status(200)
      .json({ message: "Customer successfully updated", customer });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error updating customer", details: error.message });
  }
};

//delete customer
export const deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the customer by customerId and delete it
    const deletedCustomer = await Customer.findByIdAndDelete(id);

    if (!deletedCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }
     // Delete the associated user data
     await Users.findOneAndDelete({ userName: deletedCustomer.userName });

    res.status(200).json({
      message: "Customer successfully deleted",
      deletedCustomer: {
        customerId: deletedCustomer.customerId,
        companyLegalName: deletedCustomer.companyLegalName,
        companyBrandName: deletedCustomer.companyBrandName,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error deleting customer", details: error.message });
  }
};

//list of all customers
export const listCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { customerCode: { $regex: search, $options: "i" } },
            { userName: { $regex: search, $options: "i" } },
            { companyLegalName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Get total count of customers
    const totalCustomers = await Customer.countDocuments(searchQuery);

    // Fetch customers with pagination
    const customers = await Customer.find(searchQuery)
      .select(
        "customerCode userName phone email plan status companyLegalName companyBrandName"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate total pages
    const totalPages = Math.ceil(totalCustomers / limit);

    res.status(200).json({
      customers,
      currentPage: page,
      totalPages,
      totalCustomers,
      customersPerPage: limit,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching customers", details: error.message });
  }
};

//fetch plans
export const getPlanValues = (req, res) => {
  try {
    res.status(200).json({ planValues });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching plan values", details: error.message });
  }
};

//cusstomer login
export const customerLogin = async (req, res) => {
  const { userName, password } = req.body;

  try {
    const customer = await Customer.findOne({ userName });
    if (!customer) {
      return res.status(400).json({ message: "Customer not found" });
    }

    if (!(await bcrypt.compare(password, customer.password))) {
      return res.status(400).json({ message: "Invalid password" });
    }

    if (customer.isBlocked) {
      return res.status(401).json({ message: "Customer Blocked" });
    }

    await Customer.findOneAndUpdate(
      { userName },
      { lastLoggedIn: new Date() },
      { new: true }
    );

    const token = await generateToken(customer._id, customer.email);

    return res.status(200).json({
      message: "Login successful",
      token: token,
      customer: {
        customerId: customer._id,
        userName: customer.userName,
        companyBrandName: customer.companyBrandName,
        email: customer.email,
        lastLoggedIn: customer.lastLoggedIn,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error during login", details: error.message });
  }
};

export const getSingleCustomer=async(req,res)=>{
  const {id}=req.params;
  try{
    const customerData=await Customer.findOne({userId:id});
    if(!customerData){
      return res.status(404).json({error:"customer not found with this id"})
    }
    else{
      return res.status(200).json({message:"customer data fetched successfully",customerData})
    }
  }
  catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ message: "An error occurred while fetching settings" });
}
}


