const {User, Group, GroupMembers } = require('../models/models')
const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const { Sequelize } = require('sequelize');
const sequelize = require('../db'); 

class userGroupController {
    async createUser(req, res) {
        try {
            const { email, password, role, first_name, last_name, middle_name } = req.body
            
            if (!email || !password || !role || !first_name || !last_name) {
                return next(ApiError.badRequest('Не указаны обязательные поля'))
            }

            // Проверка формата email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return next(ApiError.badRequest('Некорректный формат email'));
            }
            
            const candidate = await User.findOne({ where: { email } })
            if (candidate) {
                return next(ApiError.badRequest('Пользователь с таким email уже существует'))
            }
            
            const hashPassword = await bcrypt.hash(password, 5);
            const user = await User.create({
                email,
                password: hashPassword,
                role,
                first_name,
                last_name,
                middle_name
            });
            
            // не возвращаем пароль в ответе
            const userData = user.get()
            delete userData.password;
            
            return res.json(userData)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await User.findAll({
                attributes: ['id', 'email', 'role', 'first_name', 'last_name'],
                order: [['last_name', 'ASC']]
            })
            return res.json(users)

        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { email, role, first_name, last_name, middle_name } = req.body
            
            // проверяем существование пользователя
            const user = await User.findByPk(id)
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'))
            }
            
            // обновляем данные
            await user.update({
                email,
                role,
                first_name,
                last_name,
                middle_name
            })
            
            // не возвращаем пароль в ответе
            const userData = user.get()
            delete userData.password;
            
            return res.json(userData)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            // удаляем пользователя из всех групп
            await GroupMembers.destroy({ where: { id_user: id } })
            // удаляем самого пользователя
            const deleted = await User.destroy({ where: { id } })

            if (!deleted) {
                return next(ApiError.badRequest('Пользователь не найден'))
            }
            
            return res.json({ message: 'Пользователь успешно удален' })
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }

    async createGroup(req, res, next) {
        try {
            const { name, teacher_id, studentIds = [] } = req.body;
            
            if (!name || !teacher_id) {
            return next(ApiError.badRequest('Не указаны название группы или преподаватель'));
            }
            
            // проверяем, что teacher_id действительно преподаватель
            const teacher = await User.findOne({ 
            where: { 
                id: teacher_id,
                role: 'teacher' 
            } 
            });
            
            if (!teacher) {
            return next(ApiError.badRequest('Указанный преподаватель не найден'));
            }
            
            // Создаем транзакцию для атомарности операций
            const transaction = await sequelize.transaction();
            
            try {
            // Создаем группу
            const group = await Group.create({ name, teacher_id }, { transaction });
            
            // Добавляем студентов в группу, если они указаны
            if (studentIds && studentIds.length > 0) {
                // Проверяем, что все ID принадлежат студентам
                const studentsCount = await User.count({
                where: {
                    id: studentIds,
                    role: 'student'
                },
                transaction
                });
                
                if (studentsCount !== studentIds.length) {
                await transaction.rollback();
                return next(ApiError.badRequest('Некоторые студенты не найдены'));
                }
                
                // Создаем записи в GroupMembers
                await GroupMembers.bulkCreate(
                studentIds.map(studentId => ({
                    id_group: group.id,
                    id_user: studentId
                })),
                { transaction }
                );
            }
            
            // Фиксируем транзакцию
            await transaction.commit();
            
            // Загружаем полные данные группы для ответа
            const createdGroup = await Group.findByPk(group.id, {
                include: [
                { 
                    model: User, 
                    as: 'teacher',
                    attributes: ['id', 'first_name', 'last_name']
                },
                {
                    model: User,
                    as: 'students',
                    through: { attributes: [] },
                    attributes: ['id', 'first_name', 'last_name']
                }
                ]
            });
            
            return res.json(createdGroup);
            } catch (e) {
            await transaction.rollback();
            throw e;
            }
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
        }

    async addUserToGroup(req, res) {
        try {
            const { groupId, userId } = req.params
            
            // проверяем существование группы и пользователя
            const group = await Group.findByPk(groupId)
            const user = await User.findByPk(userId)
            
            if (!group || !user) {
                return next(ApiError.badRequest('Группа или пользователь не найдены'))
            }
            
            // проверяем, что пользователь не преподаватель и не админ
            if (user.role !== 'student') {
                return next(ApiError.badRequest('В группу можно добавлять только студентов'))
            }
            
            // добавляем пользователя в группу
            await GroupMembers.create({
                id_group: groupId,
                id_user: userId
            })
            
            return res.json({ message: 'Пользователь успешно добавлен в группу' })
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async getStudents(req, res, next) {
        try {
            const students = await User.findAll({
                where: { role: 'student' },
                attributes: ['id', 'first_name', 'last_name'],
                order: [['last_name', 'ASC']]
            });
            return res.json(students);
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }


    async getGroups(req, res, next) {
        try {
            const groups = await Group.findAll({
                include: [
                    { 
                        model: User, 
                        as: 'teacher',
                        attributes: ['id', 'first_name', 'last_name']
                    },
                    {
                        model: User,
                        as: 'students',
                        through: { 
                            attributes: [] // Не включаем поля промежуточной таблицы
                        },
                        attributes: ['id', 'first_name', 'last_name']
                    }
                ],
                order: [['name', 'ASC']]
            });
            
            return res.json(groups);
        } catch (e) {
            console.error('Error loading groups:', e);
            return next(ApiError.internal('Ошибка при загрузке групп'));
        }
    }

    async deleteGroup(req, res) {
        try {
            const { groupId } = req.params;
            
            // удаляем всех участников группы
            await GroupMembers.destroy({ where: { id_group: groupId } })
            
            // удаляем саму группу
            const deleted = await Group.destroy({ where: { id: groupId } })
            
            if (!deleted) {
                return next(ApiError.badRequest('Группа не найдена'))
            }
            
            return res.json({ message: 'Группа успешно удалена' })
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async getGroupsForTeacher(req, res) {
        try {
            const groups = await Group.findAll({
            where: { teacher_id: req.params.teacherId },
            include: [
                { 
                model: User, 
                as: 'students',
                through: { attributes: [] }
                }
            ]
            })
            res.json(groups);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Получаем группу студента по его ID
    async getStudentGroup(req, res, next) {
        try {
            const groupMember = await GroupMembers.findOne({
            where: { id_user: req.user.id },
            attributes: ['id_group']
            });
    
            return res.json({ id_group: groupMember?.id_group || null });
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }
}

module.exports = new userGroupController()