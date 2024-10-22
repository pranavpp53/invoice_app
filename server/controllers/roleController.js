import Role from "../models/role.js";

//add role
export const addRole = async (req, res) => {
  const { roleName, description, permissions } = req.body;
  const existingRole = await Role.findOne({ roleName });
  if (existingRole) {
    return res.status(400).json({ error: "Role with the same name exists" });
  }
  const newRole = new Role({ roleName, description, permissions });
  await newRole.save();
  res.status(200).json({ message: "New role successfully created" });
};

//fetch filtered roles
export const getFilteredRoles = async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  
  let query = { roleName: { $ne: 'admin' } };  // Exclude 'admin' role

  if (search) {
    query.roleName = { $regex: search, $options: 'i', $ne: 'admin' };
  }

  const total = await Role.countDocuments(query);
  const totalPages = Math.ceil(total / limitNumber);

  const roles = await Role.find(query)
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);

  if (roles.length > 0) {
    res.status(200).json({
      message: "Roles retrieved successfully",
      roles: roles,
      currentPage: pageNumber,
      totalPages: totalPages,
      totalItems: total
    });
  } else {
    res.status(404).json({ message: "No user roles found" });
  }
};

//get all roles
export const getAllRoles  =async(req,res)=>{
  const roles=await Role.find()
  return res.status(200).json(roles)
  
}

// Add this function to get a role by its ID
export const getRoleById = async (req, res) => {
  const { id } = req.params;
  try {
    const role = await Role.findById(id);
    if (role) {
      res.status(200).json(role);
    } else {
      res.status(404).json({ message: "Role not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


//delete role
export const deleteRole = async (req, res) => {
  const { id } = req.params;

  const deletedRole = await Role.findByIdAndDelete(id);

  if (deletedRole) {
    res.status(200).json({ message: "Role deleted successfully" });
  } else {
    res.status(404).json({ message: "Role not found" });
  }
};


//edit role
export const editRole = async (req, res) => {
  const { id } = req.params;
  const { roleName, description, permissions } = req.body;

  try {
    const existingRole = await Role.findById(id);
    
    if (!existingRole) {
      return res.status(404).json({ error: "Role not found" });
    }

    if (roleName !== existingRole.roleName) {
      const roleWithSameName = await Role.findOne({ roleName });
      if (roleWithSameName) {
        return res.status(400).json({ error: "A role with this name already exists" });
      }
    }

    existingRole.roleName = roleName;
    existingRole.description = description;
    existingRole.permissions = permissions;

    await existingRole.save();

    res.status(200).json({ message: "Role successfully updated", role: existingRole });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while updating the role" });
  }
};
