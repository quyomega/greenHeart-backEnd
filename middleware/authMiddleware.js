const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Lấy token từ header Authorization
  // Kiểm tra token nhận được
  // console.log('Token from headers:', token); 

  if (!token) return res.status(401).json({ message: "Vui lòng đăng nhập" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Gán thông tin người dùng vào req.user
     // Kiểm tra dữ liệu người dùng
    // console.log('Decoded user:', req.user);
    next();
  } catch (err) {
    // Log lỗi nếu token không hợp lệ
    console.log('Error decoding token:', err); 
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

module.exports = authMiddleware;
