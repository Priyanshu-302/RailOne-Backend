const { pool } = require("../config/db");

// Global Role Middleware
exports.roleHandler = (role) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Id not found",
        });
      }

      const result = await pool.query(`select role from users where id = $1`, [
        userId,
      ]);

      if (result.rows[0].role !== role) {
        return res.status(403).json({
          success: false,
          message: "Role do not matched",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
