const sequelize = require('../db')
const {DataTypes} = require('sequelize')

// пользователи
const User = sequelize.define('User', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING, unique: true, allowNull: false},
    password: {type: DataTypes.STRING, allowNull: false},
    role: {type: DataTypes.ENUM('student', 'teacher', 'admin'), allowNull: false},
    first_name: {type: DataTypes.STRING, allowNull: false},
    last_name: {type: DataTypes.STRING, allowNull: false},
    middle_name: {type: DataTypes.STRING}
})

// группа
const Group = sequelize.define('Group', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false},
    teacher_id: {type: DataTypes.INTEGER, allowNull: false}
})

// студенты группы
const GroupMembers = sequelize.define('GroupMembers', {
    id_group: {type: DataTypes.INTEGER, primaryKey: true},
    id_user: {type: DataTypes.INTEGER, primaryKey: true}
})

// учебные материалы
const StudyMaterial = sequelize.define('StudyMaterial', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    teacher_id: {type: DataTypes.INTEGER, allowNull: false},
    id_group: {type: DataTypes.INTEGER, allowNull: false},
    id_discipline: {type: DataTypes.INTEGER, allowNull: false},
    id_topic: {type: DataTypes.INTEGER, allowNull: false},
    content: {type: DataTypes.TEXT, allowNull: false},
    resource_type: {type: DataTypes.ENUM('text', 'video', 'img', 'pdf', 'url', 'document'), allowNull: false}
})

const Discipline = sequelize.define('Discipline', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false}
})

const GroupDiscipline = sequelize.define('GroupDiscipline', {
    id_group: {type: DataTypes.INTEGER, primaryKey: true},
    id_discipline: {type: DataTypes.INTEGER, primaryKey: true},
})

// темы
const Topic = sequelize.define('Topic', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false}
})

// вопросы
const Question = sequelize.define('Question', {
    id_question: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    text: {type: DataTypes.TEXT, allowNull: false,},
    difficulty: {type: DataTypes.ENUM('easy', 'medium', 'hard'), allowNull: false,},
    is_open: {type: DataTypes.BOOLEAN, allowNull: false,},
    creator_id: {type: DataTypes.INTEGER, allowNull: false,},
    id_topic: {type: DataTypes.INTEGER, allowNull: false,}
})

// для вопрсов с одним или несколькими вариантами ответов
const AnswerOptions = sequelize.define('AnswerOptions', {
    id_question: {type: DataTypes.INTEGER, allowNull: false},
    answer_text: {type: DataTypes.TEXT, allowNull: false}, // варианты ответов
    is_correct: {type: DataTypes.BOOLEAN, allowNull: false} // правильный ответ
})

// вопросы на сопоставление
const MatchingPairsAnswer = sequelize.define('MatchingPairsAnswer', {
    id_question: {type: DataTypes.INTEGER, allowNull: false},
    left_text: {type: DataTypes.STRING, allowNull: false}, // левая часть ответа
    right_text: {type: DataTypes.STRING, allowNull: false} // сопоставляется с правой
})

// открытые вопросы
const QuestionOpenAnswers = sequelize.define('QuestionOpenAnswers', {
    id_question: {type: DataTypes.INTEGER, allowNull: false},
    correct_open_keywords: {type: DataTypes.TEXT, allowNull: false}, // ключевые слова на открытый вопрос
})

// тест
const Test = sequelize.define('Test', {
    id_test: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING},
    description: {type: DataTypes.TEXT},
    time_limit: {type: DataTypes.INTEGER},
    deadline: {type: DataTypes.DATE},
    check_type: {type: DataTypes.ENUM('auto', 'manual'), allowNull: false}, // тип проверки (вручную, авто)
    is_random: {type: DataTypes.BOOLEAN}, // вопросы в рандомном порядке
    source: {type: DataTypes.ENUM('auto', 'manual'), allowNull: false}, // сделано (вручную, авто)
    passing_score: {type: DataTypes.INTEGER}, // мин балл
    creator_id: {type: DataTypes.INTEGER, allowNull: false}, 
    id_group: {type: DataTypes.INTEGER, allowNull: false},
    is_training: {type: DataTypes.BOOLEAN}
})

// сгенерированные тесты системой
const TestGeneration = sequelize.define('TestGeneration', {
    id_testGeneration: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    test_id: {type: DataTypes.INTEGER, allowNull: false},
    question_count: {type: DataTypes.INTEGER, allowNull: false},
    id_topic: {type: DataTypes.INTEGER, allowNull: false},
    is_open: {type: DataTypes.BOOLEAN, allowNull: false},
    difficulty: {type: DataTypes.ENUM('easy', 'medium', 'hard'), allowNull: false}
})

// результаты теста
const TestResult = sequelize.define('TestResult', {
    id_result: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    id_test: {type: DataTypes.INTEGER, allowNull: false},
    id_user: {type: DataTypes.INTEGER, allowNull: false},
    mark: {type: DataTypes.INTEGER},
    time_taken: {type: DataTypes.INTEGER},
    passed: {type: DataTypes.BOOLEAN}
})

// ответы пользователей
const UserAnswers = sequelize.define('UserAnswers', {
    id_result: {type: DataTypes.INTEGER, primaryKey: true, allowNull: false},
    id_question: {type: DataTypes.INTEGER, primaryKey: true, allowNull: false},
    answer_data: {type: DataTypes.TEXT, allowNull: false},
    is_correct: {type: DataTypes.BOOLEAN, allowNull: false}
})

// связующая таблица 
const TestQuestion = sequelize.define('TestQuestion', {
    id_test: {type: DataTypes.INTEGER, primaryKey: true},
    id_question: {type: DataTypes.INTEGER, primaryKey: true}
})

// пользователь(учитель) 1:N вопросы
User.hasMany(Question, { foreignKey: 'creator_id', as: 'createdQuestions' })
Question.belongsTo(User, { foreignKey: 'creator_id', as: 'creator' })

// тема 1:N вопросы
Topic.hasMany(Question, { foreignKey: 'id_topic', as: 'questions' })
Question.belongsTo(Topic, { foreignKey: 'id_topic', as: 'topic' })

// вопросы 1:N ответы на single и multiple 
Question.hasMany(AnswerOptions, { foreignKey: 'id_question', as: 'answerOptions' })
AnswerOptions.belongsTo(Question, { foreignKey: 'id_question', as: 'question' })

// вопросы 1:N ответы на сопоставление
Question.hasMany(MatchingPairsAnswer, { foreignKey: 'id_question', as: 'matchingPairs' })
MatchingPairsAnswer.belongsTo(Question, { foreignKey: 'id_question', as: 'question' })

// вопросы 1:1 ответ на открытый вопрос
Question.hasOne(QuestionOpenAnswers, { foreignKey: 'id_question', as: 'openAnswer' })
QuestionOpenAnswers.belongsTo(Question, { foreignKey: 'id_question', as: 'question' })

// пользователь (учитель) 1:N групппы
User.hasMany(Group, { foreignKey: 'teacher_id', as: 'groups' })
Group.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' })

// соединяющая таблица группы и пользователей
Group.belongsToMany(User, { through: GroupMembers, foreignKey: 'id_group', otherKey: 'id_user', as: 'students'})
User.belongsToMany(Group, { through: GroupMembers, foreignKey: 'id_user', as: 'studentGroups' })
// Добавьте отдельные ассоциации для GroupMembers
GroupMembers.belongsTo(Group, { foreignKey: 'id_group', as: 'group' });
GroupMembers.belongsTo(User, { foreignKey: 'id_user', as: 'user' });

// пользователь (учитель) 1:N тесты
User.hasMany(Test, { foreignKey: 'creator_id', as: 'createdTests' })
Test.belongsTo(User, { foreignKey: 'creator_id', as: 'creator' })

// группа 1:N тесты
Group.hasMany(Test, { foreignKey: 'id_group' })
Test.belongsTo(Group, { foreignKey: 'id_group' })

// тема 1:N генерация тестов
Topic.hasMany(TestGeneration, { foreignKey: 'id_topic' })
TestGeneration.belongsTo(Topic, { foreignKey: 'id_topic' })

TestGeneration.belongsTo(Test, { foreignKey: 'test_id' });
Test.hasOne(TestGeneration, { foreignKey: 'test_id', as: 'generation' });

// Тест 1:N Результаты теста
Test.hasMany(TestResult, { foreignKey: 'id_test'})
TestResult.belongsTo(Test, {foreignKey: 'id_test'})

// Пользователь 1:N Результаты теста
User.hasMany(TestResult, {foreignKey: 'id_user'})
TestResult.belongsTo(User, {foreignKey: 'id_user'})

// Результат теста 1:N Ответы пользователя
TestResult.hasMany(UserAnswers, {foreignKey: 'id_result'})
UserAnswers.belongsTo(TestResult, {foreignKey: 'id_result'})

// Вопрос 1:N Ответы пользователя
Question.hasMany(UserAnswers, {foreignKey: 'id_question'})
UserAnswers.belongsTo(Question, {foreignKey: 'id_question'})

// Тест N:M Вопросы (через TestQuestion)
Test.belongsToMany(Question, {through: TestQuestion, foreignKey: 'id_test'})
Question.belongsToMany(Test, {through: TestQuestion, foreignKey: 'id_question'})

TestQuestion.belongsTo(Question, { foreignKey: 'id_question', as: 'Question' });
Question.hasMany(TestQuestion, { foreignKey: 'id_question' });

// StudyMaterial связи
User.hasMany(StudyMaterial, { foreignKey: 'teacher_id' })
StudyMaterial.belongsTo(User, { foreignKey: 'teacher_id' })

Topic.hasMany(StudyMaterial, { foreignKey: 'id_topic' })
StudyMaterial.belongsTo(Topic, { foreignKey: 'id_topic' })

Group.belongsToMany(Discipline, { through: GroupDiscipline, foreignKey: 'id_group', otherKey: 'id_discipline' });
Discipline.belongsToMany(Group, { through: GroupDiscipline, foreignKey: 'id_discipline', otherKey: 'id_group' });

StudyMaterial.belongsTo(Group, { foreignKey: 'id_group' });
Group.hasMany(StudyMaterial, { foreignKey: 'id_group' });

StudyMaterial.belongsTo(Discipline, { foreignKey: 'id_discipline' });
Discipline.hasMany(StudyMaterial, { foreignKey: 'id_discipline' });

module.exports = {
    User,
    Group,
    GroupMembers,
    Topic,
    Question,
    AnswerOptions,
    MatchingPairsAnswer,
    QuestionOpenAnswers,
    StudyMaterial,
    Discipline,
    GroupDiscipline,
    Test,
    TestGeneration,
    TestResult,
    UserAnswers,
    TestQuestion
}