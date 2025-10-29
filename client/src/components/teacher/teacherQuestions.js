import React, { useState, useEffect, useContext } from 'react';
import { Container, Table, Button, Form, Modal, Alert, Row, Col } from 'react-bootstrap';
import { Context } from '../../index';
import { createQuestion, getAllQuestions, deleteQuestion, fetchAllTopics } from '../../http/teacherAPI';

const TeacherQuestions = () => {
  const { user } = useContext(Context);
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  
  // Типы вопросов
  const QUESTION_TYPES = {
    OPTIONS: 'options',
    MATCHING: 'matching',
    OPEN: 'open'
  };

  // Состояние формы вопроса
  const [questionForm, setQuestionForm] = useState({
    text: '',
    difficulty: 'medium',
    is_open: false, // false - для теста, true - тренировочный
    questionType: QUESTION_TYPES.OPTIONS, // тип вопроса
    id_topic: '',
    answerOptions: [{ answer_text: '', is_correct: false }],
    matchingPairs: [{ left_text: '', right_text: '' }],
    correct_open_keywords: ''
  });

  // Загрузка данных при монтировании
  useEffect(() => {
    const loadData = async () => {
      try {
        const [questionsData, topicsData] = await Promise.all([
          getAllQuestions(),
          fetchAllTopics()
        ]);
        setQuestions(questionsData);
        setTopics(topicsData);
        setLoading(false);
      } catch (e) {
        setError('Ошибка при загрузке данных');
        console.error(e);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Обработчик создания вопроса
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      const questionData = {
        text: questionForm.text,
        difficulty: questionForm.difficulty,
        is_open: questionForm.is_open,
        creator_id: user.user.id,
        id_topic: questionForm.id_topic
      };

      let answerData = {};
      
      if (questionForm.questionType === QUESTION_TYPES.OPEN) {
        // Открытый вопрос
        answerData = {
          openAnswer: {
            correct_open_keywords: questionForm.correct_open_keywords
          }
        };
      } else if (questionForm.questionType === QUESTION_TYPES.OPTIONS && 
                questionForm.answerOptions.some(opt => opt.answer_text.trim() !== '')) {
        // Вопрос с вариантами ответов
        answerData = {
          answerOptions: questionForm.answerOptions
        };
      } else if (questionForm.questionType === QUESTION_TYPES.MATCHING && 
                questionForm.matchingPairs.some(pair => pair.left_text.trim() !== '' && pair.right_text.trim() !== '')) {
        // Вопрос на сопоставление
        answerData = {
          matchingPairs: questionForm.matchingPairs
        };
      } else {
        throw new Error('Необходимо добавить варианты ответов или пары для сопоставления');
      }

      const newQuestion = await createQuestion({
        ...questionData,
        ...answerData
      });
      
      setQuestions([...questions, newQuestion]);
      setShowQuestionModal(false);
      resetQuestionForm();
    } catch (e) {
      console.error('Ошибка создания вопроса:', e);
      setError(e.message || 'Ошибка при создании вопроса');
    }
  };

  // Удаление вопроса
  const handleDeleteQuestion = async (id) => {
    try {
      await deleteQuestion(id);
      setQuestions(questions.filter(q => q.id_question !== id));
    } catch (e) {
      console.error('Ошибка удаления вопроса:', e);
      setError('Ошибка при удалении вопроса');
    }
  };

  // Сброс формы
  const resetQuestionForm = () => {
    setQuestionForm({
      text: '',
      difficulty: 'medium',
      is_open: false,
      questionType: QUESTION_TYPES.OPTIONS,
      id_topic: '',
      answerOptions: [{ answer_text: '', is_correct: false }],
      matchingPairs: [{ left_text: '', right_text: '' }],
      correct_open_keywords: ''
    });
  };

  // Управление вариантами ответов
  const addAnswerOption = () => {
    setQuestionForm({
      ...questionForm,
      answerOptions: [...questionForm.answerOptions, { answer_text: '', is_correct: false }]
    });
  };

  const removeAnswerOption = (index) => {
    const newOptions = [...questionForm.answerOptions];
    newOptions.splice(index, 1);
    setQuestionForm({
      ...questionForm,
      answerOptions: newOptions
    });
  };

  // Управление парами для сопоставления
  const addMatchingPair = () => {
    setQuestionForm({
      ...questionForm,
      matchingPairs: [...questionForm.matchingPairs, { left_text: '', right_text: '' }]
    });
  };

  const removeMatchingPair = (index) => {
    const newPairs = [...questionForm.matchingPairs];
    newPairs.splice(index, 1);
    setQuestionForm({
      ...questionForm,
      matchingPairs: newPairs
    });
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>;

  return (
    <Container className="mt-4" style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
      <h2>Управление вопросами</h2>
      
      <Button 
        variant="primary" 
        className="mb-3"
        onClick={() => setShowQuestionModal(true)}
      >
        Добавить вопрос
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Текст вопроса</th>
            <th>Тип вопроса</th>
            <th>Тип банка</th>
            <th>Сложность</th>
            <th>Тема</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {questions.map(question => {
            const topic = topics.find(t => t.id === question.id_topic);
            return (
              <tr key={question.id_question}>
                <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {question.text}
                </td>
                <td>
                  {question.openAnswer !== null && question.openAnswer !== undefined ? 'Открытый' : 
                  Array.isArray(question.answerOptions) && question.answerOptions.length > 0 ? 'Вариантный' : 
                  Array.isArray(question.matchingPairs) && question.matchingPairs.length > 0 ? 'Сопоставление' : 'Неизвестный'}
                </td>
                <td>
                  {question.is_open ? 'Тренировочный' : 'Оценочный'}
                </td>
                <td>
                  {question.difficulty === 'easy' && 'Легкий'}
                  {question.difficulty === 'medium' && 'Средний'}
                  {question.difficulty === 'hard' && 'Сложный'}
                </td>
                <td>{topic?.name || 'Неизвестно'}</td>
                <td>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleDeleteQuestion(question.id_question)}
                  >
                    Удалить
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {/* Модальное окно создания вопроса */}
      <Modal 
        show={showQuestionModal} 
        onHide={() => {
          setShowQuestionModal(false);
          resetQuestionForm();
        }} 
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Добавить вопрос</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleQuestionSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Текст вопроса *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={questionForm.text}
                onChange={(e) => setQuestionForm({...questionForm, text: e.target.value})}
                required
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Сложность *</Form.Label>
                  <Form.Select
                    value={questionForm.difficulty}
                    onChange={(e) => setQuestionForm({...questionForm, difficulty: e.target.value})}
                  >
                    <option value="easy">Легкий</option>
                    <option value="medium">Средний</option>
                    <option value="hard">Сложный</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Тема *</Form.Label>
                  <Form.Select
                    value={questionForm.id_topic}
                    onChange={(e) => setQuestionForm({...questionForm, id_topic: e.target.value})}
                    required
                  >
                    <option value="">Выберите тему</option>
                    {topics.map(topic => (
                      <option key={topic.id} value={topic.id}>{topic.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="bank-type-switch"
                label="Тренировочный вопрос (не для оценки)"
                checked={questionForm.is_open}
                onChange={(e) => setQuestionForm({
                  ...questionForm, 
                  is_open: e.target.checked
                })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Тип вопроса *</Form.Label>
              <div className="d-flex gap-3 mb-3">
                <Button
                  variant={questionForm.questionType === QUESTION_TYPES.OPTIONS ? 'primary' : 'outline-primary'}
                  onClick={() => setQuestionForm({
                    ...questionForm,
                    questionType: QUESTION_TYPES.OPTIONS,
                    answerOptions: [{ answer_text: '', is_correct: false }]
                  })}
                >
                  С вариантами ответов
                </Button>
                <Button
                  variant={questionForm.questionType === QUESTION_TYPES.MATCHING ? 'primary' : 'outline-primary'}
                  onClick={() => setQuestionForm({
                    ...questionForm,
                    questionType: QUESTION_TYPES.MATCHING,
                    matchingPairs: [{ left_text: '', right_text: '' }]
                  })}
                >
                  На сопоставление
                </Button>
                <Button
                  variant={questionForm.questionType === QUESTION_TYPES.OPEN ? 'primary' : 'outline-primary'}
                  onClick={() => setQuestionForm({
                    ...questionForm,
                    questionType: QUESTION_TYPES.OPEN
                  })}
                >
                  Открытый ответ
                </Button>
              </div>
            </Form.Group>
            
            {questionForm.questionType === QUESTION_TYPES.OPTIONS && (
              <Form.Group className="mb-3">
                <Form.Label>Варианты ответов (отметьте правильные)</Form.Label>
                {questionForm.answerOptions.map((option, index) => (
                  <div key={index} className="d-flex align-items-center mb-2">
                    <Form.Check
                      type="checkbox"
                      className="me-2"
                      checked={option.is_correct}
                      onChange={(e) => {
                        const newOptions = [...questionForm.answerOptions];
                        newOptions[index].is_correct = e.target.checked;
                        setQuestionForm({...questionForm, answerOptions: newOptions});
                      }}
                    />
                    <Form.Control
                      type="text"
                      value={option.answer_text}
                      onChange={(e) => {
                        const newOptions = [...questionForm.answerOptions];
                        newOptions[index].answer_text = e.target.value;
                        setQuestionForm({...questionForm, answerOptions: newOptions});
                      }}
                      placeholder="Текст варианта ответа"
                      required
                    />
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="ms-2"
                      onClick={() => removeAnswerOption(index)}
                      disabled={questionForm.answerOptions.length <= 1}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={addAnswerOption}
                >
                  Добавить вариант
                </Button>
              </Form.Group>
            )}
            
            {questionForm.questionType === QUESTION_TYPES.MATCHING && (
              <Form.Group className="mb-3">
                <Form.Label>Пары для сопоставления</Form.Label>
                {questionForm.matchingPairs.map((pair, index) => (
                  <div key={index} className="d-flex align-items-center mb-2">
                    <Form.Control
                      type="text"
                      value={pair.left_text}
                      onChange={(e) => {
                        const newPairs = [...questionForm.matchingPairs];
                        newPairs[index].left_text = e.target.value;
                        setQuestionForm({...questionForm, matchingPairs: newPairs});
                      }}
                      placeholder="Левое значение"
                      className="me-2"
                      required
                    />
                    <Form.Control
                      type="text"
                      value={pair.right_text}
                      onChange={(e) => {
                        const newPairs = [...questionForm.matchingPairs];
                        newPairs[index].right_text = e.target.value;
                        setQuestionForm({...questionForm, matchingPairs: newPairs});
                      }}
                      placeholder="Правое значение"
                      className="me-2"
                      required
                    />
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeMatchingPair(index)}
                      disabled={questionForm.matchingPairs.length <= 1}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={addMatchingPair}
                >
                  Добавить пару
                </Button>
              </Form.Group>
            )}
            
            {questionForm.questionType === QUESTION_TYPES.OPEN && (
              <Form.Group className="mb-3">
                <Form.Label>Ключевые слова для ответа *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={questionForm.correct_open_keywords}
                  onChange={(e) => setQuestionForm({
                    ...questionForm, 
                    correct_open_keywords: e.target.value
                  })}
                  placeholder="Введите ключевые слова через запятую, которые должны присутствовать в ответе студента"
                  required
                />
                <Form.Text muted>
                  Система будет проверять наличие этих слов в ответе студента
                </Form.Text>
              </Form.Group>
            )}
            
            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" onClick={() => {
                setShowQuestionModal(false);
                resetQuestionForm();
              }} className="me-2">
                Отмена
              </Button>
              <Button type="submit" variant="primary">
                Сохранить вопрос
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default TeacherQuestions;


