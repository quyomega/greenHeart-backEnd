const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Lấy token từ header

  if (!token) {
    return res.status(401).json({ message: "Không có token, quyền truy cập bị từ chối" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Giải mã token
    req.user = decoded; // Lưu thông tin user từ token vào req
    next();
  } catch (err) {
    res.status(403).json({ message: "Token không hợp lệ" });
  }
};

module.exports = authMiddleware;
