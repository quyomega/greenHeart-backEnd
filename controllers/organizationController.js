const Organization = require("../models/Organization");
const User = require("../models/User");

// Tạo tổ chức mới và tự động thêm người tạo vào tổ chức
exports.createOrganization = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id;

  try {
    // Kiểm tra xem tên tổ chức có tồn tại không
    if (!name) {
      return res.status(400).json({ message: "Tên tổ chức là bắt buộc" });
    }

    // Tạo tổ chức mới
    const newOrg = new Organization({
      name,
      description,
      createdBy: userId,
      members: [userId], // Thêm người tạo vào danh sách thành viên của tổ chức
    });

    // Lưu tổ chức vào cơ sở dữ liệu
    await newOrg.save();

    // Thêm tổ chức vào danh sách tổ chức của người dùng
    const user = await User.findById(userId);
    if (user) {
      user.organizations.push(newOrg._id);
      await user.save();
    }

    // Trả về thông tin tổ chức vừa tạo
    res.status(201).json(newOrg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi tạo tổ chức" });
  }
};

// Thêm thành viên vào tổ chức
exports.addUserToOrganization = async (req, res) => {
    const { organizationId, userId } = req.body;
    const userIdFromToken = req.user.id; // Lấy userId từ token (user đang đăng nhập)
  
    try {
      // Kiểm tra xem tổ chức có tồn tại không
      const organization = await Organization.findById(organizationId);
      if (!organization) return res.status(404).json({ message: "Tổ chức không tồn tại" });
  
      // Kiểm tra xem người thực hiện có phải là người tạo tổ chức không
      if (organization.createdBy.toString() !== userIdFromToken) {
        return res.status(403).json({ message: "Bạn không có quyền thêm thành viên vào tổ chức này." });
      }
  
      // Kiểm tra xem người dùng đã là thành viên chưa
      if (!organization.members.includes(userId)) {
        organization.members.push(userId);
        await organization.save();
      }
  
      // Thêm tổ chức vào danh sách tổ chức của người dùng
      const user = await User.findById(userId);
      if (!user.organizations.includes(organizationId)) {
        user.organizations.push(organizationId);
        await user.save();
      }
  
      res.status(200).json({ message: "Đã thêm thành viên vào tổ chức" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi khi thêm thành viên" });
    }
};  

// Lấy danh sách tổ chức của người dùng
exports.getUserOrganizations = async (req, res) => {
  const userId = req.user.id;
  try {
    // Tìm người dùng và lấy danh sách tổ chức của họ
    const user = await User.findById(userId).populate("organizations");
    res.status(200).json(user.organizations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách tổ chức" });
  }
};
exports.getOrganizationDetails = async (req, res) => {
    const { orgId } = req.params; 
  
    try {
      const organization = await Organization.findById(orgId).populate("members");
      if (!organization) {
        return res.status(404).json({ message: "Tổ chức không tồn tại" });
      }
      res.status(200).json(organization);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi khi lấy thông tin tổ chức" });
    }
  };
// Xóa thành viên khỏi tổ chức
exports.removeUserFromOrganization = async (req, res) => {
    const { organizationId, userId } = req.body;
    const userIdFromToken = req.user.id; // Lấy userId từ token (user đang đăng nhập)
  
    try {
      // Kiểm tra xem tổ chức có tồn tại không
      const organization = await Organization.findById(organizationId);
      if (!organization) return res.status(404).json({ message: "Tổ chức không tồn tại" });
  
      // Kiểm tra xem người thực hiện có phải là người tạo tổ chức không
      if (organization.createdBy.toString() !== userIdFromToken) {
        return res.status(403).json({ message: "Bạn không có quyền xóa thành viên khỏi tổ chức này." });
      }
  
      // Kiểm tra xem người dùng có phải là thành viên của tổ chức không
      if (!organization.members.includes(userId)) {
        return res.status(404).json({ message: "Người dùng không phải thành viên của tổ chức này." });
      }
  
      // Xóa thành viên khỏi tổ chức
      organization.members = organization.members.filter(member => member.toString() !== userId);
      await organization.save();
  
      // Xóa tổ chức khỏi danh sách tổ chức của người dùng
      const user = await User.findById(userId);
      user.organizations = user.organizations.filter(org => org.toString() !== organizationId);
      await user.save();
  
      res.status(200).json({ message: "Đã xóa thành viên khỏi tổ chức" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi khi xóa thành viên" });
    }
};
  