import Role from "../models/role.js";

const checkPermission = (feature, action) => {
  return async (req, res, next) => {
    try {
      const { role } = req.user;
      if (!role) {
        return res.status(403).json({ message: "Unauthorized: Role not found" });
      }

      const roleData = await Role.findOne({ _id: role });
      if (!roleData) {
        return res.status(403).json({ message: "Unauthorized: Role data not found" });
      }

      if (roleData.roleName === "admin") {
        return next();
      }

      const hasPermission = roleData.permissions?.[feature]?.[action]
      

      if (!hasPermission) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  };
};

export default checkPermission;
