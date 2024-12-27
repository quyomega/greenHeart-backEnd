const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Lấy token từ header Authorization
  console.log('Token from headers:', token); // Kiểm tra token nhận được

  if (!token) return res.status(401).json({ message: "Vui lòng đăng nhập" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Gán thông tin người dùng vào req.user
    console.log('Decoded user:', req.user); // Kiểm tra dữ liệu người dùng
    next();
  } catch (err) {
    console.log('Error decoding token:', err); // Log lỗi nếu token không hợp lệ
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

module.exports = authMiddleware;
