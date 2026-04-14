// services/auth.js (updated)
const { model } = require("mongoose");
const User = require("../../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

class AuthService {
async createUser(data) {
    const {
        username,
        phone,
        email,
        buildNo,
        floorNo,
        address,
        password,
        link,
        role
    } = data;
    console.log("Creating user with data:", data);
    // 1. Check if user already exists
    const existingUser = await User.findOne({
        where: { email }
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

    // 2. Generate unique UID
    const uid = await this.generateUniqueUid();

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    const user = await User.create({
        uid,
        username,
        phone,
        email,
        buildno: buildNo,
        link,
        floorno: floorNo,
        address,
        password: hashedPassword,
        role
    });

    return user;
}

// Helper function to generate unique UID
async createUser(data) {
    const {
        username,
        phone,
        email,
        buildNo,
        floorNo,
        address,
        password,
        link,
        role
    } = data;

    const existingUser = await User.findOne({
        where: { email }
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

    // Generate simple unique UID like t456, t457, t458, etc.
    const uid = await this.generateUniqueUid();

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        uid,
        username,
        phone,
        email,
        buildno: buildNo,
        link,
        floorno: floorNo,
        address,
        password: hashedPassword,
        role
    });

    return user;
}

async generateUniqueUid() {
    let uid;
    let isUnique = false;
    let counter = 1;
    
    while (!isUnique) {
        // Simple pattern: t + number (t1, t2, t3, etc.)
        uid = `t${counter}`;
        
        // Check if UID exists
        const existingUser = await User.findOne({
            where: { uid }
        });
        
        if (!existingUser) {
            isUnique = true;
        } else {
            counter++;
        }
    }
    
    return uid;
}

    async login(phone, password) {
        const user = await User.findOne({
            where: { phone }
        });

        if (!user) {
            throw new Error("Invalid phone or password");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new Error("Invalid phone or password");
        }

        const token = jwt.sign(
            {
                id: user.id,
                phone: user.phone,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        const safeUser = {
            id: user.id,
            UID: user.uid,
            username: user.username,
            phone: user.phone,
            email: user.email,
            role: user.role
        };

        return {
            user: safeUser,
            token
        };
    }

    async getUserById(id) {
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });
        return user;
    }

    async updateUser(id, updateData) {
        const user = await User.findByPk(id);
        if (!user) {
            return null;
        }
        await user.update(updateData);
        const updatedUser = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });
        return updatedUser;
    }

    async deleteUser(id) {
        const user = await User.findByPk(id);
        if (!user) {
            return false;
        }
        await user.destroy();
        return true;
    }

    async getAllUsers(page = 1, limit = 10, role = null) {
        const offset = (page - 1) * limit;
        const where = {};
        
        if (role) {
            where.role = role;
        }

        const { count, rows } = await User.findAndCountAll({
            where,
            attributes: { exclude: ['password'] },
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        return {
            users: rows,
            total: count,
            page,
            limit,
            pages: Math.ceil(count / limit)
        };
    }

    async changePassword(userId, oldPassword, newPassword) {
        const user = await User.findByPk(userId);
        
        if (!user) {
            throw new Error("User not found");
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        
        if (!isMatch) {
            throw new Error("Invalid old password");
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedNewPassword });
        
        return true;
    }
}

module.exports = new AuthService();