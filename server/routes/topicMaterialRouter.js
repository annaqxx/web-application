const express = require('express')
const router = express.Router()
const topicMaterialController = require('../controllers/topicMaterialController')
const checkRole = require('../middleware/checkRoleMiddleware')

// преподаватель создает/редактирует материалы
router.post('/materials', checkRole('teacher'), topicMaterialController.createMaterial)
router.get('/materials', topicMaterialController.getAllMaterials) // для студента 

router.get('/materials/group/:groupId', topicMaterialController.getMaterialsByGroup)
router.get('/materials/discipline/:disciplineId', topicMaterialController.getMaterialsByDiscipline)
router.get('/materials/topic/:topicId', topicMaterialController.getMaterialsByTopic)

router.put('/materials/:id', checkRole('teacher'), topicMaterialController.updateMaterial)
router.delete('/materials/:id', checkRole('teacher'), topicMaterialController.deleteMaterial)

router.post('/topic', checkRole('teacher'), topicMaterialController.createTopic)
router.get('/topic', checkRole('teacher'), topicMaterialController.getAllTopics)
router.put('/topic/:id', checkRole('teacher'), topicMaterialController.updateTopic)
router.delete('/topic/:id', checkRole('teacher'), topicMaterialController.deleteTopic)
router.get('/topic/disciplines/:disciplineId', topicMaterialController.getTopicsByDiscipline);

// Дисциплины
router.post('/disciplines', checkRole('teacher'), topicMaterialController.createDiscipline)
router.get('/disciplines', topicMaterialController.getAllDisciplines)
router.get('/disciplines/group/:groupId', topicMaterialController.getDisciplinesByGroup)
router.put('/disciplines/:id', checkRole('teacher'), topicMaterialController.updateDiscipline)
router.delete('/disciplines/:id', checkRole('teacher'), topicMaterialController.deleteDiscipline)

// Связи групп и дисциплин
router.post('/group-disciplines', checkRole('teacher'), topicMaterialController.addDisciplineToGroup)
router.delete('/group-disciplines', checkRole('teacher'), topicMaterialController.removeDisciplineFromGroup)


module.exports = router