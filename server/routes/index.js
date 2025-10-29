const Router = require('express')
const router = new Router()

// Импорт роутеров
const authRouter = require('./authRouter')
const userGroupRouter = require('./userGroupRouter')
const topicMaterialRouter = require('./topicMaterialRouter')
const testQuestionRouter = require('./testQuestionRouter')
const resultAnswerRouter = require('./resultAnswerRouter')

// Подключение роутеров
router.use('/auth', authRouter)
router.use('/userGroup', userGroupRouter)
router.use('/topicMaterial', topicMaterialRouter)
router.use('/testQuestion', testQuestionRouter)
router.use('/results', resultAnswerRouter)

module.exports = router