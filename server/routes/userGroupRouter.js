const express = require('express')
const router = express.Router()
const userGroupController = require('../controllers/userGroupController')
const checkRole = require('../middleware/checkRoleMiddleware')

// Управление пользователями
router.get('/users', checkRole('admin'), userGroupController.getAllUsers)
router.post('/users', checkRole('admin'), userGroupController.createUser)
router.put('/users/:id', checkRole('admin'), userGroupController.updateUser)
router.delete('/users/:id', checkRole('admin'), userGroupController.deleteUser)

// Управление группами
router.get('/groups', checkRole('admin'), userGroupController.getGroups)
router.post('/groups', checkRole('admin'), userGroupController.createGroup)
router.post('/groups/:groupId/users/:userId', checkRole('admin'), userGroupController.addUserToGroup)
router.delete('/groups/:groupId', checkRole('admin'), userGroupController.deleteGroup)

router.get('/students', checkRole('admin'), userGroupController.getStudents);

router.get('/groups/:teacherId', checkRole('teacher'), userGroupController.getGroupsForTeacher);

router.get('/group', checkRole('student'), userGroupController.getStudentGroup);

module.exports = router