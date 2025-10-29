const {TestResult, UserAnswers, Test, Question, User, Group, GroupMembers} = require('../models/models')
const ApiError = require('../error/ApiError')

class resultAnswerController {
    // сохранение результата теста 
    async saveTestResult(req, res, next) {
        try {
            const { id_test, id_user, mark, time_taken, passed, answers } = req.body;
            
            // Создаем запись о результате теста
            const testResult = await TestResult.create({
                id_test,
                id_user,
                mark,
                time_taken,
                passed
            })
            // Сохраняем ответы пользователя
            await Promise.all(answers.map(answer => 
                UserAnswers.create({
                    id_result: testResult.id_result,
                    id_question: answer.id_question,
                    answer_data: answer.answer_data,
                    is_correct: answer.is_correct
                })
            ))
            return res.json(testResult);
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }

    async getAllResults(req, res) {
        try {
            const results = await TestResult.findAll({
                include: [
                    { model: User },
                    { 
                        model: Test,
                        where: { is_training: false } // Исключаем тренировочные тесты
                    }
                ]
            })
            return res.json(results);
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }

    async getResultById(req, res) {
        try {
            const { id } = req.params;
            const result = await TestResult.findOne({
                where: { id_result: id },
                include: [
                    { model: User },
                    { model: Test },
                    { model: UserAnswers }
                ]
            });
            
            if (!result) {
                return next(ApiError.badRequest('Результат не найден'));
            }
            
            return res.json(result);
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }

    async getUserResults(req, res) {
        try {
            const { userId } = req.params;
            const results = await TestResult.findAll({
                where: { id_user: userId },
                include: [
                    { model: Test }
                ]
            });
            return res.json(results);
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }

    async getTestResults(req, res) {
        try {
            const { testId } = req.params;
            const results = await TestResult.findAll({
                where: { id_test: testId },
                include: [
                    { model: User }
                ]
            });
            return res.json(results);
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }

    async getUserAnswers(req, res) {
        try {
            const { resultId } = req.params;
            const answers = await UserAnswers.findAll({
                where: { id_result: resultId },
                include: [
                    { model: Question }
                ]
            });
            return res.json(answers);
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }

    async getStudentResults(req, res, next) {
        try {
            const userId = req.user.id; // ID студента из токена
            
            const results = await TestResult.findAll({
                where: { id_user: userId },
                include: [
                    {
                        model: Test,
                        where: { is_training: false }, //  для исключения тренировочных тестов
                        include: [
                            { 
                                model: User, 
                                as: 'creator', 
                                attributes: ['first_name', 'last_name'] 
                            },
                            { model: Group }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
            
            return res.json(results);
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }

    async getGroupResults(req, res, next) {
        try {
            const { groupId } = req.params;
            
            const group = await Group.findOne({
                where: { id: groupId },
                include: [{
                    model: User,
                    as: 'teacher',
                    attributes: ['id']
                }]
            });

            if (!group) {
                return next(ApiError.badRequest('Группа не найдена'));
            }

            const students = await User.findAll({
                include: [
                    {
                        model: Group,
                        as: 'studentGroups',
                        where: { id: groupId },
                        attributes: []
                    },
                    {
                        model: TestResult,
                        include: [{
                            model: Test,
                            where: { is_training: false }, // Исключаем тренировочные тесты
                            attributes: ['id_test', 'title']
                        }],
                        required: false
                    }
                ],
                where: { role: 'student' }
            });

            const results = students.map(student => {
                return {
                    studentId: student.id,
                    studentName: `${student.last_name} ${student.first_name} ${student.middle_name || ''}`,
                    results: student.TestResults ? student.TestResults.map(result => ({
                        testId: result.Test.id_test,
                        testTitle: result.Test.title,
                        mark: result.mark,
                        passed: result.passed,
                        timeTaken: result.time_taken,
                        createdAt: result.createdAt
                    })) : []
                };
            });

            return res.json(results);
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }
}

module.exports = new resultAnswerController()