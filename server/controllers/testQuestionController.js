const {Test, Question, TestGeneration, Topic, AnswerOptions, MatchingPairsAnswer, 
    QuestionOpenAnswers, TestQuestion, User, Group, UserAnswers, TestResult, GroupMembers} = require('../models/models')
const ApiError = require('../error/ApiError')
const { Sequelize } = require('sequelize');
const sequelize = require('../db'); 
const { Op } = require('sequelize')

class testQuestionController {
    async createTest(req, res, next) {
        try {
            const { title, description, time_limit, deadline, check_type, is_random, 
                source, passing_score, creator_id, id_group, is_training } = req.body

            if (!title || !check_type || !source || !creator_id || !id_group) {
                return next(ApiError.badRequest('Не все обязательные поля заполнены'))
            }

            const test = await Test.create({
                title, description, time_limit, deadline, 
                check_type, is_random, source, passing_score, 
                creator_id, id_group, is_training
            })
            return res.json(test)
        } catch (e) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async getAllTests(req, res) {
        try {
            const tests = await Test.findAll({
                include: [
                    { model: User, as: 'creator' },
                    { model: Group }
                ]
            })
            return res.json(tests)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async getTestById(req, res) {
        try {
            const { id } = req.params
            const test = await Test.findOne({
                where: { id_test: id },
                include: [
                    { model: User, as: 'creator' },
                    { model: Group },
                    { 
                        model: Question,
                        through: { attributes: [] } // исключаем данные из промежуточной таблицы
                    }
                ]
            })
            if (!test) {
                return next(ApiError.notFound('Тест не найден'))
            }
            return res.json(test)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async updateTest(req, res, next) {
        try {
            const { id } = req.params
            const updateData = req.body
            if (Object.keys(updateData).length === 0) {
                return next(ApiError.badRequest('Нет данных для обновления'))
            }
            const test = await Test.findOne({ where: { id_test: id } })
            if (!test) {
                return next(ApiError.notFound('Тест не найден'))
            }
            await Test.update(updateData, { where: { id_test: id } })
            const updatedTest = await Test.findOne({ where: { id_test: id } })
            return res.json(updatedTest)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async deleteTest(req, res, next) {
        try {
            const { id } = req.params;
            const { is_generated } = req.body;

            // Удаляем связанные вопросы для сгенерированных тестов
            if (is_generated) {
            // 1. Находим запись о генерации
            const generation = await TestGeneration.findOne({ where: { test_id: id } });
            
            // 2. Удаляем все вопросы, связанные с этим тестом
            await TestQuestion.destroy({ where: { id_test: id } });
            
            // 3. Удаляем запись о генерации
            if (generation) {
                await generation.destroy();
            }
            }

            // Удаляем сам тест
            await Test.destroy({ where: { id_test: id } });
            
            return res.json({ message: 'Тест успешно удален' });
        } catch (e) {
            next(ApiError.internal(e.message));
        }
        }

    async createQuestion(req, res, next) {
        try {
            const { text, difficulty, is_open, creator_id, id_topic, 
                answerOptions, matchingPairs, openAnswer } = req.body
            if (!text || !difficulty || is_open === undefined || !creator_id || !id_topic) {
                return next(ApiError.badRequest('Не все обязательные поля заполнены'))
            }
            // основной вопрос
            const question = await Question.create({
                text,
                difficulty,
                is_open,
                creator_id,
                id_topic
            })

            if (answerOptions && answerOptions.length > 0) {
                // вопрос с вариантами ответов
                await Promise.all(answerOptions.map(option => 
                    AnswerOptions.create({
                        id_question: question.id_question,
                        answer_text: option.answer_text,
                        is_correct: option.is_correct
                    })
                ))
            } else if (matchingPairs && matchingPairs.length > 0) {
                // Вопрос на сопоставление
                await Promise.all(matchingPairs.map(pair => 
                    MatchingPairsAnswer.create({
                        id_question: question.id_question,
                        left_text: pair.left_text,
                        right_text: pair.right_text
                    })
                ))
            } else if (openAnswer) {
                // Открытый вопрос
                await QuestionOpenAnswers.create({
                    id_question: question.id_question,
                    correct_open_keywords: openAnswer.correct_open_keywords
                })
            } else {
                await question.destroy()
                return next(ApiError.internal(e.message))
            }
            return res.json(question)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async getAllQuestions(req, res, next) {
        try {
            const questions = await Question.findAll({
                include: [
                    { 
                        model: User, 
                        as: 'creator',
                        attributes: ['id', 'first_name', 'last_name'] 
                    },
                    {
                        model: AnswerOptions,
                        as: 'answerOptions',
                        required: false
                    },
                    {
                        model: MatchingPairsAnswer,
                        as: 'matchingPairs',
                        required: false
                    },
                    {
                        model: QuestionOpenAnswers,
                        as: 'openAnswer',
                        required: false
                    }
                ],
                attributes: ['id_question', 'text', 'difficulty', 'is_open', 'id_topic']
            });
            
            return res.json(questions || []);
            
        } catch (e) {
            console.error('Error:', e);
            return next(ApiError.internal('Не удалось загрузить вопросы'));
        }
    }

    async getQuestionById(req, res) {
        try {
            const { id } = req.params;
            const question = await Question.findOne({
                where: { id_question: id },
                include: [
                    { 
                    model: User, 
                    as: 'creator',
                    attributes: ['id', 'first_name', 'last_name'] 
                    }
                ],
                attributes: ['id_question', 'text', 'difficulty', 'is_open', 'id_topic']
            });
            
            if (!question) {
                return res.status(404).json({ message: 'Вопрос не найден' });
            }
            
            return res.json(question);
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async deleteQuestion(req, res) {
        try {
            const { id } = req.params;
            // удаляем связанные ответы
            await AnswerOptions.destroy({ where: { id_question: id } });
            await MatchingPairsAnswer.destroy({ where: { id_question: id } });
            await QuestionOpenAnswers.destroy({ where: { id_question: id } });
            await TestQuestion.destroy({ where: { id_question: id } });
            // удаляем сам вопрос
            const deleted = await Question.destroy({
                where: { id_question: id }
            })
            if (!deleted) {
                return res.status(404).json({ message: 'Вопрос не найден' });
            }
            return res.json({ message: 'Вопрос успешно удален' });
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async addQuestionToTest(req, res, next) {
        try {
            const { id } = req.params; // id теста из URL
            const { id_question } = req.body;

            // Проверяем, есть ли уже такой вопрос в тесте
            const existing = await TestQuestion.findOne({
            where: { id_test: id, id_question }
            });

            if (existing) {
            return next(ApiError.badRequest('Этот вопрос уже есть в тесте!'));
            }

            // Если вопроса нет — добавляем
            await TestQuestion.create({ id_test: id, id_question });

            // Возвращаем обновленный тест
            const test = await Test.findOne({
            where: { id_test: id },
            include: [Question]
            });

            return res.json(test);
        } catch (e) {
            next(ApiError.internal(e.message));
        }
    }

    async removeQuestionFromTest (req, res) {
        try {
            const { testId, questionId } = req.params;

            // Проверяем существование теста
            const test = await Test.findOne({ where: { id_test: testId } });
            if (!test) {
            return res.status(404).json({ message: 'Тест не найден' });
            }

            // Проверяем существование вопроса
            const question = await Question.findOne({ where: { id_question: questionId } });
            if (!question) {
            return res.status(404).json({ message: 'Вопрос не найден' });
            }

            // Удаляем связь между тестом и вопросом
            await TestQuestion.destroy({
            where: {
                id_test: testId,
                id_question: questionId
            }
            });

            res.json({ success: true, message: 'Вопрос успешно удален из теста' });
        } catch (error) {
            console.error('Ошибка при удалении вопроса из теста:', error);
            res.status(500).json({ message: 'Ошибка при удалении вопроса из теста' });
        }
    }

    async generateTest(req, res, next) {
        try {
            const { question_count, id_topic, difficulty, test_id, is_training } = req.body;
            if (!question_count || !id_topic || !difficulty || !test_id || is_training === undefined) {
                return next(ApiError.badRequest('Не указаны обязательные параметры генерации'));
            }
            
            // Определяем is_open на основе is_training
            const is_open = is_training;
            
            const questions = await Question.findAll({
                where: {
                    id_topic,
                    is_open, // автоматически устанавливается по типу теста
                    difficulty
                },
                limit: question_count,
                order: sequelize.random()
            })

            if (questions.length < question_count) {
                return next(ApiError.badRequest(
                    `Недостаточно вопросов по заданным критериям. Найдено: ${questions.length}, требуется: ${question_count}`
                ))
            }
            
            const generation = await TestGeneration.create({
                test_id,
                question_count,
                id_topic,
                is_open, // сохраняем для истории
                difficulty
            })
            
            await Promise.all(questions.map(question => 
                TestQuestion.create({
                    id_test: test_id,
                    id_question: question.id_question
                })
            ))
            
            // Обновляем is_training у теста
            await Test.update({ is_training }, { where: { id_test: test_id } });
            
            return res.json({
                generation,
                questions_added: questions.length
            })
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getTestsByGroup(req, res, next) {
        try {
            const { groupId } = req.params;
            const { is_training } = req.query;

            const whereClause = {
                id_group: groupId
            };
            
            // Добавляем фильтр по is_training, если параметр передан
            if (is_training !== undefined) {
                whereClause.is_training = is_training === 'true';
            }

            const tests = await Test.findAll({
                where: whereClause,
                where: { id_group: groupId },
                include: [
                    { model: User, as: 'creator' },
                    { model: Group },
                    { 
                        model: Question,
                        through: { attributes: [] }
                    }
                ]
            });
            return res.json(tests);
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }

    // Получение теста для прохождения
    async getTestForStudent(req, res, next) {
        try {
            const {testId} = req.params;
            const userId = req.user.id;

            // Получаем информацию о тесте
            const test = await Test.findOne({
                where: {id_test: testId},
                attributes: ['id_test', 'title', 'description', 'time_limit', 'deadline', 'passing_score', 'is_training', 'id_group', 'is_random'],
                include: [{
                    model: TestGeneration,
                    as: 'generation',
                    attributes: ['id_topic', 'difficulty', 'question_count', 'is_open']
                }]
            });

            if (!test) {
                return next(ApiError.badRequest('Тест не найден'));
            }

            // Для тренировочных тестов пропускаем проверку завершенных попыток
            if (!test.is_training) {
                const completedAttempts = await TestResult.findAll({
                    where: {
                        id_test: testId,
                        id_user: userId,
                        mark: { [Op.not]: null }
                    },
                    order: [['createdAt', 'ASC']]
                });

                if (completedAttempts.length > 0) {
                    // Ищем тренировочный тест только если оценочный не пройден
                    if (!completedAttempts[0].passed) {
                        const trainingTest = await Test.findOne({
                            where: {
                                id_group: test.id_group,
                                is_training: true,
                                ...(test.generation ? { 
                                    '$generation.id_topic$': test.generation.id_topic 
                                } : {})
                            },
                            include: [{
                                model: TestGeneration,
                                as: 'generation',
                                attributes: ['id_topic']
                            }],
                            attributes: ['id_test', 'title']
                        });

                        return res.json({
                            testId,
                            alreadyCompleted: true,
                            bestResult: completedAttempts[0],
                            suggestTraining: !!trainingTest,
                            trainingTestId: trainingTest?.id_test,
                            trainingTestTitle: trainingTest?.title || 'Тренировочный тест'
                        });
                    }
                    return res.json({
                        testId,
                        alreadyCompleted: true,
                        bestResult: completedAttempts[0]
                    });
                }
            }

            // Проверка активной попытки (для всех тестов)
            const activeResult = await TestResult.findOne({
                where: {
                    id_test: testId,
                    id_user: userId,
                    mark: null
                }
            });
            
            if (activeResult) {
                return res.json({
                    testId,
                    resultId: activeResult.id_result,
                    continue: true
                });
            }

            // Получаем вопросы для теста
            const questions = await Question.findAll({
                where: {
                    is_open: test.is_training,
                    ...(test.generation ? {
                        id_topic: test.generation.id_topic,
                        difficulty: test.generation.difficulty
                    } : {})
                },
                include: [
                    {model: AnswerOptions, as: 'answerOptions'},
                    {model: MatchingPairsAnswer, as: 'matchingPairs'},
                    {model: QuestionOpenAnswers, as: 'openAnswer'}
                ]
            });

            if (questions.length === 0) {
                return next(ApiError.badRequest('Тест не содержит вопросов'));
            }

            // Формируем ответ
            return res.json({
                id_test: test.id_test,
                title: test.title,
                description: test.description,
                time_limit: test.time_limit,
                deadline: test.deadline,
                is_training: test.is_training,
                passing_score: test.passing_score,
                questions: questions.map(q => ({
                    id_question: q.id_question,
                    text: q.text,
                    difficulty: q.difficulty,
                    type: q.answerOptions?.length ? 'options' : 
                        q.matchingPairs?.length ? 'matching' : 'open',
                    options: q.answerOptions?.map(o => ({id: o.id, text: o.answer_text})),
                    pairs: q.matchingPairs?.map(p => ({left: p.left_text, right: p.right_text})),
                    keywords: q.openAnswer?.correct_open_keywords.split(',').map(k => k.trim())
                }))
            });
        } catch (e) {
            console.error('Error in getTestForStudent:', e);
            return next(ApiError.internal('Ошибка при загрузке теста'));
        }
    }
    
    // Начало теста (создание записи о результате)
    async startTest(req, res, next) {
        try {
            const {testId} = req.body;
            const userId = req.user.id;

            // Проверяем существование теста
            const test = await Test.findByPk(testId);
            if (!test) {
                return next(ApiError.badRequest('Тест не найден'));
            }

            // Для оценочных тестов проверяем завершенные попытки
            if (!test.is_training) {
                const completedAttempts = await TestResult.findAll({
                    where: {
                        id_test: testId,
                        id_user: userId,
                        mark: { [Op.not]: null }
                    }
                });

                if (completedAttempts.length > 0) {
                    return next(ApiError.badRequest('Вы уже проходили этот тест'));
                }
            }

            // Проверяем активную попытку
            const existingResult = await TestResult.findOne({
                where: {
                    id_test: testId,
                    id_user: userId,
                    mark: null
                }
            });
            
            if (existingResult) {
                return res.json({resultId: existingResult.id_result});
            }
            
            // Создаем новую запись
            const result = await TestResult.create({
                id_test: testId,
                id_user: userId,
                time_taken: 0,
                passed: false
            });
            
            return res.json({resultId: result.id_result});
        } catch (e) {
            console.error('Error in startTest:', e);
            return next(ApiError.internal('Ошибка при старте теста'));
        }
    }
    
    // Отправка ответов на тест
    async submitTest(req, res, next) {
        const t = await sequelize.transaction()
        try {
            const {resultId, answers, timeTaken} = req.body
            const userId = req.user.id
            
            // Получаем результат теста
            const testResult = await TestResult.findOne({
                where: {id_result: resultId, id_user: userId},
                include: [{model: Test}]
            }, {transaction: t})
            
            if (!testResult) {
                await t.rollback()
                return next(ApiError.badRequest('Результат теста не найден'))
            }
            
            // Проверяем, не завершен ли уже тест
            if (testResult.mark !== null) {
                await t.rollback()
                return next(ApiError.badRequest('Тест уже завершен'))
            }
            
            // Проверяем дедлайн
            if (new Date(testResult.Test.deadline) < new Date()) {
                await t.rollback()
                return next(ApiError.badRequest('Срок сдачи теста истек'))
            }
            
            // Получаем вопросы теста
            const testQuestions = await TestQuestion.findAll({
                where: {id_test: testResult.id_test},
                include: [{
                    model: Question,
                    as: 'Question' // если указано в ассоциации
                }],
                transaction: t
            });
            
            let totalScore = 0
            let maxScore = testQuestions.length
            const userAnswers = []
            
            // Проверяем каждый ответ
            for (const answer of answers) {
                const question = testQuestions.find(q => q.id_question === answer.questionId)
                if (!question) continue
                
                let isCorrect = false
                let score = 0
                
                // Проверка в зависимости от типа вопроса
                if (!question.Question.is_open) {
                    // Вопрос с вариантами ответов
                    const correctAnswers = await AnswerOptions.findAll({
                        where: {
                            id_question: question.id_question,
                            is_correct: true
                        }
                    }, {transaction: t})
                    
                    // Для single choice
                    if (!Array.isArray(answer.answer)) {
                        isCorrect = correctAnswers.some(c => c.id === answer.answer)
                    } 
                    // Для multiple choice
                    else {
                        const correctIds = correctAnswers.map(c => c.id)
                        isCorrect = answer.answer.length === correctIds.length && 
                                   answer.answer.every(a => correctIds.includes(a))
                    }
                    
                    score = isCorrect ? 1 : 0
                } 
                // Вопрос на сопоставление
                else if (question.Question.matchingPairs && question.Question.matchingPairs.length > 0) {
                    const correctPairs = await MatchingPairsAnswer.findAll({
                        where: {id_question: question.id_question}
                    }, {transaction: t})
                    
                    if (answer.answer && answer.answer.length === correctPairs.length) {
                        isCorrect = answer.answer.every(a => {
                            const correctPair = correctPairs.find(p => 
                                p.left_text === a.left && p.right_text === a.right
                            )
                            return !!correctPair
                        })
                    }
                    
                    score = isCorrect ? 1 : 0
                }
                // Открытый вопрос
                else {
                    const correctKeywords = await QuestionOpenAnswers.findOne({
                        where: {id_question: question.id_question}
                    }, {transaction: t})
                    
                    if (correctKeywords && answer.answer) {
                        const keywords = correctKeywords.correct_open_keywords
                            .toLowerCase()
                            .split(',')
                            .map(k => k.trim())
                        
                        const answerText = answer.answer.toLowerCase()
                        const foundKeywords = keywords.filter(k => answerText.includes(k))
                        
                        // Оценка по проценту найденных ключевых слов
                        score = keywords.length > 0 ? 
                            parseFloat((foundKeywords.length / keywords.length).toFixed(2)) : 
                            0
                        isCorrect = score >= 0.7 // 70% ключевых слов для зачета
                    }
                }
                
                totalScore += score
                
                // Сохраняем ответ пользователя
                userAnswers.push({
                    id_result: resultId,
                    id_question: question.id_question,
                    answer_data: JSON.stringify(answer.answer),
                    is_correct: isCorrect
                })
            }
            
            // Сохраняем все ответы пользователя
            await UserAnswers.bulkCreate(userAnswers, {transaction: t})
            
            // Рассчитываем оценку (в процентах)
            const percentage = Math.round((totalScore / maxScore) * 100)
            const passed = percentage >= testResult.Test.passing_score
            
            // Обновляем результат теста
            await testResult.update({
                mark: percentage,
                time_taken: timeTaken,
                passed: passed
            }, {transaction: t})
            // После сохранения результатов:
            if (!testResult.passed && !testResult.Test.is_training) {
                // Ищем тренировочный тест по теме
                const trainingTest = await Test.findOne({
                    where: {
                        id_group: testResult.Test.id_group,
                        is_training: true,
                        // Дополнительные условия для поиска соответствующего тренировочного теста
                    },
                    attributes: ['id_test', 'title']
                });

                await t.commit();
                return res.json({
                    resultId,
                    score: percentage,
                    passed,
                    maxScore,
                    passingScore: testResult.Test.passing_score,
                    suggestTraining: !!trainingTest,
                    trainingTestId: trainingTest?.id_test
                });
            }

            await t.commit();
            return res.json({
                resultId,
                score: percentage,
                passed,
                maxScore,
                passingScore: testResult.Test.passing_score
            });
        } catch (e) {
            await t.rollback()
            return next(ApiError.internal(e.message))
        }
    }    

    // Получение списка тренировочных тестов
    async getTrainingTests(req, res, next) {
        try {
            const userId = req.user.id;

            const groupMember = await GroupMembers.findOne({
                where: { id_user: userId },
                include: [{
                    model: Group,
                    as: 'group',
                    required: true
                }]
            });
            
            if (!groupMember) {
                return next(ApiError.badRequest('Пользователь не состоит в группе'));
            }
            
            // Получаем тренировочные тесты для группы
            const tests = await Test.findAll({
                where: {
                    id_group: groupMember.id_group,
                    is_training: true
                },
                include: [{
                    model: TestGeneration,
                    as: 'generation',
                    attributes: ['id_topic', 'difficulty', 'question_count']
                }],
                attributes: ['id_test', 'title', 'description', 'createdAt', 'time_limit', 'passing_score'],
                order: [['createdAt', 'DESC']]
            });
            
            return res.json(tests);
        } catch (e) {
            console.error('Error in getTrainingTests:', e);
            return next(ApiError.internal('Ошибка при получении тренировочных тестов'));
        }
    }

    // Получение тренировочного теста для прохождения
    async getTrainingTest(req, res, next) {
        try {
            const {testId} = req.params;
            const userId = req.user.id;
            
            // Проверяем, что тест существует и является тренировочным
            const test = await Test.findOne({
                where: {
                    id_test: testId,
                    is_training: true
                },
                include: [{
                    model: TestGeneration,
                    as: 'generation',
                    attributes: ['id_topic', 'difficulty', 'question_count']
                }],
                attributes: ['id_test', 'title', 'description', 'time_limit', 'passing_score']
            });
            
            if (!test) {
                return next(ApiError.badRequest('Тренировочный тест не найден'));
            }
            
            // Получаем вопросы для теста (только с is_open=true)
            let questions;
            
            if (test.generation) {
                // Для автоматически сгенерированных тестов
                questions = await Question.findAll({
                    where: {
                        id_topic: test.generation.id_topic,
                        difficulty: test.generation.difficulty,
                        is_open: true
                    },
                    include: [
                        {model: AnswerOptions, as: 'answerOptions'},
                        {model: MatchingPairsAnswer, as: 'matchingPairs'},
                        {model: QuestionOpenAnswers, as: 'openAnswer'}
                    ],
                    limit: test.generation.question_count,
                    order: sequelize.random() // Для случайного порядка вопросов
                });
            } else {
                // Для тестов с ручным подбором вопросов
                questions = await Question.findAll({
                    include: [{
                        model: TestQuestion,
                        where: {id_test: testId},
                        attributes: []
                    }],
                    where: {
                        is_open: true
                    },
                    include: [
                        {model: AnswerOptions, as: 'answerOptions'},
                        {model: MatchingPairsAnswer, as: 'matchingPairs'},
                        {model: QuestionOpenAnswers, as: 'openAnswer'}
                    ]
                });
            }
            
            if (questions.length === 0) {
                return next(ApiError.badRequest('Тест не содержит вопросов'));
            }
            
            // Формируем ответ
            const formattedQuestions = questions.map(q => {
                const questionData = {
                    id_question: q.id_question,
                    text: q.text,
                    difficulty: q.difficulty,
                    type: q.answerOptions?.length ? 'options' : 
                        q.matchingPairs?.length ? 'matching' : 'open'
                };
                
                if (q.answerOptions?.length) {
                    questionData.options = q.answerOptions.map(o => ({
                        id: o.id,
                        text: o.answer_text
                    }));
                }
                
                if (q.matchingPairs?.length) {
                    questionData.pairs = q.matchingPairs.map(p => ({
                        left: p.left_text,
                        right: p.right_text
                    }));
                }
                
                if (q.openAnswer) {
                    questionData.keywords = q.openAnswer.correct_open_keywords.split(',').map(k => k.trim());
                }
                
                return questionData;
            });
            
            return res.json({
                id_test: test.id_test,
                title: test.title,
                description: test.description,
                time_limit: test.time_limit,
                passing_score: test.passing_score,
                questions: formattedQuestions
            });
        } catch (e) {
            console.error('Error in getTrainingTest:', e);
            return next(ApiError.internal('Ошибка при загрузке тренировочного теста'));
        }
    }

    // Отправка ответов на тренировочный тест
    async submitTrainingTest(req, res, next) {
        try {
            const {testId} = req.params;
            const {answers} = req.body;
            const userId = req.user.id;
            
            // Проверяем, что тест существует и является тренировочным
            const test = await Test.findOne({
                where: {
                    id_test: testId,
                    is_training: true
                },
                attributes: ['id_test', 'passing_score']
            });
            
            if (!test) {
                return next(ApiError.badRequest('Тренировочный тест не найден'));
            }
            
            // Получаем вопросы теста (только с is_open=true)
            let questions;
            
            if (test.generation) {
                questions = await Question.findAll({
                    where: {
                        id_topic: test.generation.id_topic,
                        difficulty: test.generation.difficulty,
                        is_open: true
                    },
                    include: [
                        {model: AnswerOptions, as: 'answerOptions', where: {is_correct: true}, required: false},
                        {model: MatchingPairsAnswer, as: 'matchingPairs', required: false},
                        {model: QuestionOpenAnswers, as: 'openAnswer', required: false}
                    ],
                    limit: test.generation.question_count
                });
            } else {
                questions = await Question.findAll({
                    include: [{
                        model: TestQuestion,
                        where: {id_test: testId},
                        attributes: []
                    }],
                    where: {
                        is_open: true
                    },
                    include: [
                        {model: AnswerOptions, as: 'answerOptions', where: {is_correct: true}, required: false},
                        {model: MatchingPairsAnswer, as: 'matchingPairs', required: false},
                        {model: QuestionOpenAnswers, as: 'openAnswer', required: false}
                    ]
                });
            }
            
            if (questions.length === 0) {
                return next(ApiError.badRequest('Тест не содержит вопросов'));
            }
            
            let totalScore = 0;
            const maxScore = questions.length;
            const results = [];
            
            // Проверяем каждый ответ
            for (const question of questions) {
                const userAnswer = answers[question.id_question];
                let isCorrect = false;
                let score = 0;
                let correctAnswer = null;
                
                // Проверка в зависимости от типа вопроса
                if (question.answerOptions?.length > 0) {
                    // Вопрос с вариантами ответов
                    correctAnswer = question.answerOptions.map(o => o.id);
                    
                    if (Array.isArray(userAnswer)) {
                        // Для multiple choice
                        isCorrect = userAnswer.length === correctAnswer.length && 
                                userAnswer.every(a => correctAnswer.includes(a));
                    } else if (userAnswer !== undefined) {
                        // Для single choice
                        isCorrect = correctAnswer.includes(userAnswer);
                    }
                    
                    score = isCorrect ? 1 : 0;
                } 
                else if (question.matchingPairs?.length > 0) {
                    // Вопрос на сопоставление
                    correctAnswer = question.matchingPairs.map(p => ({
                        left: p.left_text,
                        right: p.right_text
                    }));
                    
                    if (Array.isArray(userAnswer)) {
                        isCorrect = userAnswer.length === correctAnswer.length && 
                                userAnswer.every((a, i) => 
                                    a.left === correctAnswer[i].left && 
                                    a.right === correctAnswer[i].right
                                );
                    }
                    
                    score = isCorrect ? 1 : 0;
                }
                else if (question.openAnswer) {
                    // Открытый вопрос
                    correctAnswer = question.openAnswer.correct_open_keywords;
                    const keywords = correctAnswer.toLowerCase().split(',').map(k => k.trim());
                    
                    if (typeof userAnswer === 'string') {
                        const answerText = userAnswer.toLowerCase();
                        const foundKeywords = keywords.filter(k => answerText.includes(k));
                        
                        // Оценка по проценту найденных ключевых слов
                        score = keywords.length > 0 ? 
                            parseFloat((foundKeywords.length / keywords.length).toFixed(2)) : 
                            0;
                        isCorrect = score >= 0.7; // 70% ключевых слов для зачета
                    }
                }
                
                totalScore += score;
                
                // Сохраняем результат для отображения пользователю
                results.push({
                    questionId: question.id_question,
                    questionText: question.text,
                    userAnswer,
                    correctAnswer,
                    isCorrect,
                    score
                });
            }
            
            // Рассчитываем оценку (в процентах)
            const percentage = Math.round((totalScore / maxScore) * 100);
            const passingScore = test.passing_score || 70;
            
            return res.json({
                testId,
                score: percentage,
                maxScore,
                passingScore,
                passed: percentage >= passingScore,
                results: results
            });
        } catch (e) {
            console.error('Error in submitTrainingTest:', e);
            return next(ApiError.internal('Ошибка при проверке тренировочного теста'));
        }
    }

}

module.exports = new testQuestionController()