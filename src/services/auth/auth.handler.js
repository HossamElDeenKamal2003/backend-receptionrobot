// handlers/authHandler.js
const AuthService = require("./auth.service");
const { validationResult } = require("express-validator");

class AuthHandler {
    async createUser(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: {
                        ar: "بيانات غير صالحة",
                        en: "Invalid data"
                    },
                    errors: errors.array()
                });
            }

            const userData = {
                username: req.body.username,
                phone: req.body.phone,
                email: req.body.email,
                buildNo: req.body.buildNo,
                floorNo: req.body.floorNo,
                address: req.body.address,
                password: req.body.password,
                link: req.body.link,
                role: req.body.role || "user"
            };
            console.log("Received user data for creation:", userData);
            const user = await AuthService.createUser(userData);

            // Remove password from response
            const userResponse = {
                id: user.id,
                UID: user.UID,
                username: user.username,
                phone: user.phone,
                email: user.email,
                buildNo: user.buildNo,
                floorNo: user.floorNo,
                address: user.address,
                role: user.role,
                createdAt: user.createdAt
            };

            return res.status(201).json({
                success: true,
                message: {
                    ar: "تم إنشاء المستخدم بنجاح",
                    en: "User created successfully"
                },
                data: userResponse
            });

        } catch (error) {
            console.error("Create user error:", error);
            
            if (error.message === "User already exists") {
                return res.status(409).json({
                    success: false,
                    message: {
                        ar: "المستخدم موجود بالفعل",
                        en: "User already exists"
                    },
                    error: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: {
                    ar: "حدث خطأ أثناء إنشاء المستخدم",
                    en: "Error creating user"
                },
                error: error.message
            });
        }
    }

    async login(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: {
                        ar: "بيانات غير صالحة",
                        en: "Invalid data"
                    },
                    errors: errors.array()
                });
            }

            const { phone, password } = req.body;

            if (!phone || !password) {
                return res.status(400).json({
                    success: false,
                    message: {
                        ar: "رقم الهاتف وكلمة المرور مطلوبان",
                        en: "Phone and password are required"
                    }
                });
            }

            const result = await AuthService.login(phone, password);

            return res.status(200).json({
                success: true,
                message: {
                    ar: "تم تسجيل الدخول بنجاح",
                    en: "Login successful"
                },
                data: {
                    user: result.user,
                    token: result.token
                }
            });

        } catch (error) {
            console.error("Login error:", error);
            
            if (error.message === "Invalid phone or password") {
                return res.status(401).json({
                    success: false,
                    message: {
                        ar: "رقم الهاتف أو كلمة المرور غير صحيحة",
                        en: "Invalid phone or password"
                    },
                    error: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: {
                    ar: "حدث خطأ أثناء تسجيل الدخول",
                    en: "Error during login"
                },
                error: error.message
            });
        }
    }

    async getUserProfile(req, res) {
        try {
            const userId = req.user.id; 

            const user = await AuthService.getUserById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: {
                        ar: "المستخدم غير موجود",
                        en: "User not found"
                    }
                });
            }

            const userResponse = {
                id: user.id,
                UID: user.uid,
                username: user.username,
                phone: user.phone,
                email: user.email,
                buildNo: user.buildno,
                link: user.link,
                floorNo: user.floorno,
                address: user.address,
                role: user.role
            };
            console.log("User profile fetched:", userResponse);

            return res.status(200).json({
                success: true,
                message: {
                    ar: "تم جلب البيانات بنجاح",
                    en: "Data fetched successfully"
                },
                data: userResponse
            });

        } catch (error) {
            console.error("Get user profile error:", error);
            return res.status(500).json({
                success: false,
                message: {
                    ar: "حدث خطأ أثناء جلب البيانات",
                    en: "Error fetching user data"
                },
                error: error.message
            });
        }
    }

    async updateUser(req, res) {
        try {
            const userId = req.params.id || req.user.id;
            const updateData = req.body;

            // Don't allow password update through this endpoint
            delete updateData.password;
            delete updateData.id;

            const updatedUser = await AuthService.updateUser(userId, updateData);

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: {
                        ar: "المستخدم غير موجود",
                        en: "User not found"
                    }
                });
            }

            const userResponse = {
                id: updatedUser.id,
                UID: updatedUser.uid,
                username: updatedUser.username,
                phone: updatedUser.phone,
                email: updatedUser.email,
                buildNo: updatedUser.buildNo,
                floorNo: updatedUser.floorNo,
                address: updatedUser.address,
                role: updatedUser.role
            };

            return res.status(200).json({
                success: true,
                message: {
                    ar: "تم تحديث البيانات بنجاح",
                    en: "Data updated successfully"
                },
                data: userResponse
            });

        } catch (error) {
            console.error("Update user error:", error);
            return res.status(500).json({
                success: false,
                message: {
                    ar: "حدث خطأ أثناء تحديث البيانات",
                    en: "Error updating user data"
                },
                error: error.message
            });
        }
    }

    async deleteUser(req, res) {
        try {
            const userId = req.params.id;

            const deleted = await AuthService.deleteUser(userId);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: {
                        ar: "المستخدم غير موجود",
                        en: "User not found"
                    }
                });
            }

            return res.status(200).json({
                success: true,
                message: {
                    ar: "تم حذف المستخدم بنجاح",
                    en: "User deleted successfully"
                }
            });

        } catch (error) {
            console.error("Delete user error:", error);
            return res.status(500).json({
                success: false,
                message: {
                    ar: "حدث خطأ أثناء حذف المستخدم",
                    en: "Error deleting user"
                },
                error: error.message
            });
        }
    }

    async getAllUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const role = req.query.role;

            const result = await AuthService.getAllUsers(page, limit, role);

            return res.status(200).json({
                success: true,
                message: {
                    ar: "تم جلب المستخدمين بنجاح",
                    en: "Users fetched successfully"
                },
                data: result.users,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    pages: result.pages
                }
            });

        } catch (error) {
            console.error("Get all users error:", error);
            return res.status(500).json({
                success: false,
                message: {
                    ar: "حدث خطأ أثناء جلب المستخدمين",
                    en: "Error fetching users"
                },
                error: error.message
            });
        }
    }

    async changePassword(req, res) {
        try {
            const userId = req.user.id;
            const { oldPassword, newPassword } = req.body;

            if (!oldPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: {
                        ar: "كلمة المرور القديمة والجديدة مطلوبة",
                        en: "Old and new passwords are required"
                    }
                });
            }

            const result = await AuthService.changePassword(userId, oldPassword, newPassword);

            return res.status(200).json({
                success: true,
                message: {
                    ar: "تم تغيير كلمة المرور بنجاح",
                    en: "Password changed successfully"
                }
            });

        } catch (error) {
            console.error("Change password error:", error);
            
            if (error.message === "Invalid old password") {
                return res.status(401).json({
                    success: false,
                    message: {
                        ar: "كلمة المرور القديمة غير صحيحة",
                        en: "Invalid old password"
                    },
                    error: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: {
                    ar: "حدث خطأ أثناء تغيير كلمة المرور",
                    en: "Error changing password"
                },
                error: error.message
            });
        }
    }
}

module.exports = new AuthHandler();