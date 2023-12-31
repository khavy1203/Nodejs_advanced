import db from '../models/index.js';//connectdb
import { checkEmail, checkPhone, hashUserPassword } from './loginRegisterService.js';
const getUserWithPagination = async (page, limit) => {
    try {
        let offset = (page - 1) * limit;
        const { count, rows } = await db.User.findAndCountAll({
            offset: offset,
            limit: limit,
            attributes: [
                "id",
                "userEmail",
                "userName",
                "address",
                "sex",
                "phone",
                "groupId"],
            include: {
                model: db.Group, attributes: [
                    "id",
                    "name",
                    "description",
                ]
            },
            order: [['id', 'DESC']]
        });
        //count tổng số bảng ghi, rows là mảng các phần tử
        let totalPages = Math.ceil(count / limit);
        let data = {
            totalRows: count,
            totalPages: totalPages,
            users: rows
        }

        return {
            EM: 'create page successfully',
            EC: '0',
            DT: data
        }
    } catch (e) {
        console.log("error from service : >>>", e);
        return {
            EM: 'Something wrong ...',
            EC: '-2',
            DT: ''
        }
    }
}
const getAllUsers = async () => {
    try {

        let users = await db.User.findAll({
            attributes: [
                "id",
                "userEmail",
                "userName",
                "address",
                "sex",
                "phone",
                "groupId"],
            include: {
                model: db.Group, attributes: [
                    "name",
                    "description",
                ]
            },
            raw: true,//kiểu ob js
            nest: true //kiểu gộp dữ liệu lại
        });

        if (users) {

            return {
                EM: 'get data successfully',
                EC: '0',
                DT: users
            }
        }
        return {
            EM: 'get data fail',
            EC: '-1',
            DT: []
        }

    } catch (e) {
        console.log("error from service : >>>", e);
        return {
            EM: 'Something wrong ...',
            EC: '-2',
            DT: ''
        }
    }
}
const createUser = async (data) => {
    try {
        if (await checkEmail(data.userEmail) === true) {
            return {
                EM: 'Email exist',
                EC: 1,
                DT: 'userEmail'
            }
        } else if (await checkPhone(data.phone) === true) {
            return {
                EM: 'Phone exist',
                EC: 1,
                DT: 'phone'
            }
        }
        let hashPassword = hashUserPassword(data.userPassword);
        let user = { ...data, userPassword: hashPassword };
        await db.User.create(user);
        return {
            EM: 'create user successfully',
            EC: 0,
            DT: ''
        }
    } catch (e) {
        console.log("error from service : >>>", e);
        return {
            EM: 'Something wrong ...',
            EC: '-2',
            DT: ''
        }
    }
}
const updateUser = async (user) => {
    try {
        let findUser = await db.User.findOne({ where: { id: user.id } });
        if (findUser) {
            findUser.set({
                userName: user.userName,
                address: user.address,
                sex: user.sex,
                phone: user.phone,
                groupId: user.groupId
            });
            await findUser.save();
            return {
                EM: 'Update success',
                EC: '0',
                DT: ''
            }
        }
        return {
            EM: 'Not find or something error',
            EC: '1',
            DT: ''
        }

    } catch (e) {
        console.log("error from service : >>>", e);
        return {
            EM: 'Something wrong ...',
            EC: '-2',
            DT: ''
        }
    }
}
const deleteUser = async (id) => {
    try {
        const user = await db.User.findOne({ where: { id: id } });

        if (user) {
            await user.destroy();
            return {
                EM: 'Delete successfully',
                EC: '0',
                DT: []
            }
        } else {
            return {
                EM: 'No user find',
                EC: '1',
                DT: []
            }
        }

    } catch (e) {
        console.log("error from service delete: >>>", e);
        return {
            EM: 'Something wrong ...',
            EC: '-2',
            DT: ''
        }
    }
}
module.exports = {
    getAllUsers, createUser, updateUser, deleteUser, getUserWithPagination
}