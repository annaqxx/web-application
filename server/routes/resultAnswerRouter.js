const express = require('express')
const router = express.Router()
const resultAnswerController = require('../controllers/resultAnswerController')
const checkRole = require('../middleware/checkRoleMiddleware')

// Результаты тестов
router.post('/results', checkRole('teacher'), resultAnswerController.saveTestResult)
router.get('/results', checkRole('teacher'), resultAnswerController.getAllResults)
router.get('/results/:id', checkRole('teacher'), resultAnswerController.getResultById)
router.get('/results/user/:userId', checkRole('teacher'), resultAnswerController.getUserResults)
router.get('/results/test/:testId', checkRole('teacher'), resultAnswerController.getTestResults)
router.get('/results/group/:groupId', checkRole('teacher'), resultAnswerController.getGroupResults)

// Ответы пользователей
router.get('/answers/:resultId', checkRole('teacher'), resultAnswerController.getUserAnswers)

router.get('/student/results', checkRole('student'), resultAnswerController.getStudentResults) 

module.exports = router 