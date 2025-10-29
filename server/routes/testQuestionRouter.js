const express = require('express')
const router = express.Router()
const testQuestionController = require('../controllers/testQuestionController')
const checkRole = require('../middleware/checkRoleMiddleware')

// Управление тестами
router.post('/tests', checkRole('teacher'), testQuestionController.createTest)
router.get('/tests', checkRole('teacher'), testQuestionController.getAllTests)
router.get('/tests/:id', checkRole('teacher'), testQuestionController.getTestById)
router.put('/tests/:id', checkRole('teacher'), testQuestionController.updateTest)
router.delete('/tests/:id', checkRole('teacher'), testQuestionController.deleteTest)

router.post('/tests/:id/questions', checkRole('teacher'), testQuestionController.addQuestionToTest)
router.delete('/tests/:testId/questions/:questionId', checkRole('teacher'), testQuestionController.removeQuestionFromTest)

// Управление вопросами
router.post('/questions', checkRole('teacher'), testQuestionController.createQuestion)
router.get('/questions', checkRole('teacher'), testQuestionController.getAllQuestions)
router.get('/questions/:id', checkRole('teacher'), testQuestionController.getQuestionById)
router.delete('/questions/:id', checkRole('teacher'), testQuestionController.deleteQuestion)

// Генерация тестов
router.post('/generate', checkRole('teacher'), testQuestionController.generateTest)

router.get('/tests/group/:groupId', testQuestionController.getTestsByGroup); // для студента
// тестирование для студентов 
router.get('/student/tests/:testId', checkRole('student'), testQuestionController.getTestForStudent)
router.post('/start', checkRole('student'), testQuestionController.startTest)
router.post('/submit', checkRole('student'), testQuestionController.submitTest)
// тренировка
router.get('/student/train', checkRole('student'), testQuestionController.getTrainingTests)
router.get('/student/train/:testId', checkRole('student'), testQuestionController.getTrainingTest)
router.post('/student/train/:testId/submit', checkRole('student'), testQuestionController.submitTrainingTest)

module.exports = router