import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Card, ListGroup, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { getAllTests, getTestById, addQuestionToTest, getAllQuestions, 
  removeQuestionFromTest, deleteTest, createTest, generateTest, fetchAllTopics } from '../../http/teacherAPI';
import { observer } from 'mobx-react-lite';

const TeacherTests = observer(() => {
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showTestDetails, setShowTestDetails] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState({
    tests: false,
    questions: false,
    testDetails: false,
    addingQuestion: false,
    removingQuestion: false,
    deletingTest: false,
    topics: false,
    generatingTest: false,
    creatingTest: false
  });

  const [showGenerateTest, setShowGenerateTest] = useState(false);
  const [generationParams, setGenerationParams] = useState({
    question_count: 10,
    id_topic: '',
    difficulty: 'medium',
    test_title: '',
    id_group: '',
    passing_score: '', 
    time_limit: '',    
    deadline: '',      
    check_type: 'auto',
    is_training: false
  });

  const [topics, setTopics] = useState([]);
  const [testForm, setTestForm] = useState({
    title: '',
    description: '',
    time_limit: '',
    deadline: '',
    check_type: 'auto',
    is_random: false,
    source: 'manual',
    passing_score: '',
    id_group: '',
    is_training: false
  });

  useEffect(() => {
    fetchTests();
    fetchAllQuestions();
    fetchTopics();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(prev => ({...prev, tests: true}));
      const data = await getAllTests();
      setTests(data);
    } catch (error) {
      console.error('Ошибка при загрузке тестов:', error);
      setError('Ошибка при загрузке тестов');
    } finally {
      setLoading(prev => ({...prev, tests: false}));
    }
  };

  const fetchAllQuestions = async () => {
    try {
      setLoading(prev => ({...prev, questions: true}));
      const data = await getAllQuestions();
      setQuestions(data);
    } catch (error) {
      console.error('Ошибка при загрузке вопросов:', error);
      setError('Ошибка при загрузке вопросов');
    } finally {
      setLoading(prev => ({...prev, questions: false}));
    }
  };

  const fetchTopics = async () => {
    try {
      setLoading(prev => ({...prev, topics: true}));
      const data = await fetchAllTopics(); // убрали деструктуризацию { data }
      setTopics(data || []); // гарантируем, что topics будет массивом
    } catch (error) {
      console.error('Ошибка при загрузке тем:', error);
      setError('Ошибка при загрузке тем');
      setTopics([]); // в случае ошибки устанавливаем пустой массив
    } finally {
      setLoading(prev => ({...prev, topics: false}));
    }
  };

  const handleTestSelect = async (testId) => {
    try {
      setLoading(prev => ({...prev, testDetails: true}));
      const test = await getTestById(testId);
      setSelectedTest(test);
      setShowTestDetails(true);
    } catch (error) {
      console.error('Ошибка при загрузке теста:', error);
      setError('Ошибка при загрузке теста');
    } finally {
      setLoading(prev => ({...prev, testDetails: false}));
    }
  };

  // В методе handleAddQuestionClick
  const handleAddQuestionClick = async () => {
    try {
      setLoading(prev => ({...prev, questions: true}));
      
      // Загружаем вопросы в зависимости от типа теста
      const questionsData = await getAllQuestions({
        is_open: selectedTest.is_training // только соответствующие банку
      });
      
      setQuestions(questionsData);
      setShowAddQuestion(true);
    } catch (error) {
      setError('Ошибка загрузки вопросов');
    } finally {
      setLoading(prev => ({...prev, questions: false}));
    }
  };

  const handleAddQuestion = async () => {
    if (!selectedQuestion || !selectedTest) return;

    // Проверяем соответствие банка вопроса типу теста
    if (selectedQuestion.is_open !== selectedTest.is_training) {
      setError('Нельзя добавить вопрос из этого банка');
      return;
    }
    
    try {
      setLoading(prev => ({...prev, addingQuestion: true}));
      await addQuestionToTest(selectedTest.id_test, selectedQuestion.id_question);
      // Обновляем данные теста после добавления вопроса
      const updatedTest = await getTestById(selectedTest.id_test);
      setSelectedTest(updatedTest);
      setShowAddQuestion(false);
      setSelectedQuestion(null);
      setSuccess('Вопрос успешно добавлен в тест');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Ошибка при добавлении вопроса:', error);
      setError('Ошибка при добавлении вопроса');
    } finally {
      setLoading(prev => ({...prev, addingQuestion: false}));
    }
  };

  const handleRemoveQuestion = async (questionId) => {
    if (!selectedTest) return;
    
    try {
      setLoading(prev => ({...prev, removingQuestion: true}));
      await removeQuestionFromTest(selectedTest.id_test, questionId);
      // Обновляем данные теста после удаления вопроса
      const updatedTest = await getTestById(selectedTest.id_test);
      setSelectedTest(updatedTest);
      setSuccess('Вопрос успешно удален из теста');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Ошибка при удалении вопроса:', error);
      setError('Ошибка при удалении вопроса');
    } finally {
      setLoading(prev => ({...prev, removingQuestion: false}));
    }
  };

  const handleDeleteTest = async () => {
    if (!selectedTest) return;
    
    try {
      setLoading(prev => ({...prev, deletingTest: true}));
      
      // Добавляем флаг, что это сгенерированный тест
      await deleteTest(selectedTest.id_test, selectedTest.source === 'auto');
      
      setSuccess('Тест успешно удален');
      setTimeout(() => setSuccess(null), 3000);
      
      // Обновляем список тестов
      await fetchTests();
    } catch (error) {
      console.error('Ошибка при удалении теста:', error);
      setError('Ошибка при удалении теста: ' + error.message);
    } finally {
      setShowDeleteConfirm(false);
      setShowTestDetails(false);
      setSelectedTest(null);
      setLoading(prev => ({...prev, deletingTest: false}));
    }
  };

  const handleCreateTest = async () => {
    try {
      setLoading(prev => ({...prev, creatingTest: true}));
      const newTest = await createTest({
        ...testForm,
        creator_id: 3, // Здесь должен быть ID текущего пользователя (учителя)
        passing_score: testForm.passing_score || null,
        time_limit: testForm.time_limit || null,
        is_training: testForm.is_training
      });
      
      setTests([...tests, newTest]);
      setShowCreateTest(false);
      setTestForm({
        title: '',
        description: '',
        time_limit: '',
        deadline: '',
        check_type: 'auto',
        is_random: false,
        source: 'manual',
        passing_score: '',
        id_group: '',
        is_training: false 
      });
      setSuccess('Тест успешно создан');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Ошибка при создании теста:', error);
      setError('Ошибка при создании теста');
    } finally {
      setLoading(prev => ({...prev, creatingTest: false}));
    }
  };

  const handleTestFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTestForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCloseTestDetails = () => {
    setShowTestDetails(false);
    setSelectedTest(null);
  };

  const handleCloseAddQuestion = () => {
    setShowAddQuestion(false);
    setSelectedQuestion(null);
  };

  // Добавим метод для генерации теста
  const handleGenerateTest = async () => {
    try {
      setLoading(prev => ({...prev, generatingTest: true}));
      
      const testData = {
        title: generationParams.test_title,
        description: `Сгенерированный ${generationParams.is_training ? 'тренировочный' : 'оценочный'} тест по теме "${topics.find(t => t.id === generationParams.id_topic)?.name || ''}"`,
        check_type: generationParams.check_type,
        is_random: true,
        source: 'auto',
        creator_id: 3,
        id_group: generationParams.id_group,
        passing_score: generationParams.passing_score || null,
        time_limit: generationParams.time_limit || null,
        deadline: generationParams.deadline || null,
        is_training: generationParams.is_training
      };
      
      const newTest = await createTest(testData);
      
      await generateTest({
        question_count: generationParams.question_count,
        id_topic: generationParams.id_topic,
        difficulty: generationParams.difficulty,
        test_id: newTest.id_test,
        is_training: generationParams.is_training
      });
      
      await fetchTests();
      setShowGenerateTest(false);
      setSuccess(`Тест успешно сгенерирован (${generationParams.is_training ? 'тренировочный' : 'оценочный'})`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Ошибка при генерации теста:', error);
      setError('Ошибка при генерации теста');
    } finally {
      setLoading(prev => ({...prev, generatingTest: false}));
    }
  };

  const handleGenerationParamsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGenerationParams(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Container className="mt-5 pt-4" style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
      <h2 className="mb-4">Управление тестами</h2>
      
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

      <div className="d-flex justify-content-end mb-3 gap-2">
        <Button 
          variant="success" 
          onClick={() => setShowCreateTest(true)}
        >
          Создать тест
        </Button>
        <Button 
          variant="primary" 
          onClick={() => setShowGenerateTest(true)}
        >
          Сгенерировать тест
        </Button>
      </div>
      
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <span>Список тестов</span>
            <Button variant="primary" size="sm" onClick={fetchTests} disabled={loading.tests}>
              {loading.tests ? <Spinner animation="border" size="sm" /> : 'Обновить'}
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {loading.tests ? (
            <div className="text-center">
              <Spinner animation="border" />
              <p>Загрузка тестов...</p>
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Тип</th>
                  <th>Описание</th>
                  <th>Группа</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {tests.length > 0 ? (
                  tests.map(test => (
                    <tr key={test.id_test}>
                      <td>{test.title}</td>
                      <td>{test.is_training ? 'Тренировочный' : 'Оценочный'}</td>
                      <td>{test.description || '—'}</td>
                      <td>{test.Group?.name || '—'}</td>
                      <td>
                        <div className="d-flex flex-column gap-2">
                          <Button 
                            variant="info"
                            size="sm"
                            onClick={() => handleTestSelect(test.id_test)}
                            disabled={loading.testDetails}
                          >
                            {loading.testDetails && selectedTest?.id_test === test.id_test ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              'Просмотр'
                            )}
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => {
                              setSelectedTest(test);
                              setShowDeleteConfirm(true);
                            }}
                            disabled={loading.deletingTest}
                          >
                            Удалить
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">Тесты не найдены</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Модальное окно с деталями теста */}
      <Modal show={showTestDetails} onHide={handleCloseTestDetails} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Тест: {selectedTest?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading.testDetails ? (
            <div className="text-center">
              <Spinner animation="border" />
              <p>Загрузка информации о тесте...</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p><strong>Описание:</strong> {selectedTest?.description || '—'}</p>
                <p><strong>Группа:</strong> {selectedTest?.Group?.name || '—'}</p>
                <p><strong>Тип проверки:</strong> {selectedTest?.check_type || '—'}</p>
                <p><strong>Проходной балл:</strong> {selectedTest?.passing_score || '—'}</p>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Вопросы в тесте:</h5>
                <Button 
                  variant="success" 
                  size="sm"
                  onClick={handleAddQuestionClick}
                >
                  Добавить вопрос
                </Button>
              </div>

              {selectedTest?.Questions && selectedTest.Questions.length > 0 ? (
                <ListGroup>
                  {selectedTest.Questions.map(question => (
                    <ListGroup.Item key={question.id_question} className="d-flex justify-content-between align-items-center">
                      <div>
                        <div dangerouslySetInnerHTML={{ __html: question.text }} />
                        <div className="mt-2">
                          <small className="text-muted me-3">
                            <strong>Сложность:</strong> {question.difficulty}
                          </small>
                          <small className="text-muted">
                            <strong>Банк:</strong> {question.is_open ? 'Открытый' : 'Закрытый'}
                          </small>
                        </div>
                      </div>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleRemoveQuestion(question.id_question)}
                        disabled={loading.removingQuestion}
                      >
                        {loading.removingQuestion ? (
                          <Spinner animation="border" size="sm" />
                        ) : 'Удалить'}
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="alert alert-info">В тесте пока нет вопросов</div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseTestDetails}>
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Модальное окно для добавления вопроса */}
      <Modal show={showAddQuestion} onHide={handleCloseAddQuestion} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Добавить вопрос в тест</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading.questions ? (
            <div className="text-center">
              <Spinner animation="border" />
              <p>Загрузка вопросов...</p>
            </div>
          ) : (
            <>
              <Form.Group controlId="questionSelect" className="mb-4">
                <Form.Label>Выберите вопрос:</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedQuestion?.id_question || ''}
                  onChange={(e) => {
                    const questionId = parseInt(e.target.value);
                    const question = questions.find(q => q.id_question === questionId);
                    setSelectedQuestion(question);
                  }}
                >
                  <option value="">Выберите вопрос из списка</option>
                  {questions.map(question => (
                    <option key={question.id_question} value={question.id_question}>
                      {question.text.length > 100 
                        ? `${question.text.substring(0, 100)}...` 
                        : question.text}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              
              {selectedQuestion && (
                <Card>
                  <Card.Header>Информация о вопросе</Card.Header>
                  <Card.Body>
                    <p><strong>Текст:</strong> {selectedQuestion.text}</p>
                    <p><strong>Сложность:</strong> {selectedQuestion.difficulty}</p>
                    <p><strong>Банк:</strong> {selectedQuestion.is_open ? 'Открытый' : 'Закрытый'}</p>
                    <p><strong>Тема:</strong> {selectedQuestion.topic?.name || '—'}</p>
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddQuestion}>
            Отмена
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddQuestion} 
            disabled={!selectedQuestion || loading.addingQuestion}
          >
            {loading.addingQuestion ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Добавление...
              </>
            ) : 'Добавить вопрос'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Модальное окно подтверждения удаления теста */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Подтверждение удаления</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Вы уверены, что хотите удалить тест "{selectedTest?.title}"? Это действие нельзя отменить.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Отмена
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteTest}
            disabled={loading.deletingTest}
          >
            {loading.deletingTest ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Удаление...
              </>
            ) : 'Удалить тест'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Модальное окно создания теста */}
      <Modal show={showCreateTest} onHide={() => setShowCreateTest(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Создание нового теста</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Название теста *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={testForm.title}
                    onChange={handleTestFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Группа *</Form.Label>
                  <Form.Control
                    type="text"
                    name="id_group"
                    value={testForm.id_group}
                    onChange={handleTestFormChange}
                    placeholder="ID группы"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Описание</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={testForm.description}
                onChange={handleTestFormChange}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Лимит времени (минут)</Form.Label>
                  <Form.Control
                    type="number"
                    name="time_limit"
                    value={testForm.time_limit}
                    onChange={handleTestFormChange}
                    min="1"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Дедлайн</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="deadline"
                    value={testForm.deadline}
                    onChange={handleTestFormChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Тип проверки *</Form.Label>
                  <Form.Select
                    name="check_type"
                    value={testForm.check_type}
                    onChange={handleTestFormChange}
                    required
                  >
                    <option value="auto">Автоматическая</option>
                    <option value="manual">Ручная</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Проходной балл</Form.Label>
                  <Form.Control
                    type="number"
                    name="passing_score"
                    value={testForm.passing_score}
                    onChange={handleTestFormChange}
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
            <Form.Check
                type="checkbox"
                label="Тренировочный тест"
                name="is_training"
                checked={testForm.is_training}
                onChange={handleTestFormChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Рандомный порядок вопросов"
                name="is_random"
                checked={testForm.is_random}
                onChange={handleTestFormChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Источник теста *</Form.Label>
              <Form.Select
                name="source"
                value={testForm.source}
                onChange={handleTestFormChange}
                required
              >
                <option value="manual">Ручное создание</option>
                <option value="auto">Автоматическая генерация</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateTest(false)}>
            Отмена
          </Button>
          <Button 
            variant="success" 
            onClick={handleCreateTest}
            disabled={loading.creatingTest || !testForm.title || !testForm.id_group}
          >
            {loading.creatingTest ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Создание...
              </>
            ) : 'Создать тест'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Модальное окно для генерации теста */}
      <Modal show={showGenerateTest} onHide={() => setShowGenerateTest(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Генерация теста</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Название теста *</Form.Label>
                  <Form.Control
                    type="text"
                    name="test_title"
                    value={generationParams.test_title}
                    onChange={handleGenerationParamsChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Группа *</Form.Label>
                  <Form.Control
                    type="text"
                    name="id_group"
                    value={generationParams.id_group}
                    onChange={handleGenerationParamsChange}
                    placeholder="ID группы"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Тема *</Form.Label>
                  <Form.Select
                    name="id_topic"
                    value={generationParams.id_topic}
                    onChange={handleGenerationParamsChange}
                    required
                  >
                    <option value="">Выберите тему</option>
                    {topics.map(topic => (
                      <option key={topic.id} value={topic.id}>{topic.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Количество вопросов *</Form.Label>
                  <Form.Control
                    type="number"
                    name="question_count"
                    value={generationParams.question_count}
                    onChange={handleGenerationParamsChange}
                    min="1"
                    max="50"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Тип теста</Form.Label>
                  <Form.Select
                    name="is_training"
                    value={generationParams.is_training}
                    onChange={(e) => {
                      const isTraining = e.target.value === 'true';
                      setGenerationParams(prev => ({
                        ...prev,
                        is_training: isTraining
                      }));
                    }}
                  >
                    <option value={false}>Оценочный</option>
                    <option value={true}>Тренировочный</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Сложность</Form.Label>
                  <Form.Select
                    name="difficulty"
                    value={generationParams.difficulty}
                    onChange={handleGenerationParamsChange}
                  >
                    <option value="easy">Легкая</option>
                    <option value="medium">Средняя</option>
                    <option value="hard">Сложная</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mt-3">
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Лимит времени (минут)</Form.Label>
                  <Form.Control
                    type="number"
                    name="time_limit"
                    value={generationParams.time_limit}
                    onChange={handleGenerationParamsChange}
                    min="1"
                    placeholder="Не ограничено"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Проходной балл</Form.Label>
                  <Form.Control
                    type="number"
                    name="passing_score"
                    value={generationParams.passing_score}
                    onChange={handleGenerationParamsChange}
                    min="0"
                    placeholder="Не требуется"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Дедлайн</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="deadline"
                    value={generationParams.deadline}
                    onChange={handleGenerationParamsChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Тип проверки</Form.Label>
              <Form.Select
                name="check_type"
                value={generationParams.check_type}
                onChange={handleGenerationParamsChange}
              >
                <option value="auto">Автоматическая</option>
                <option value="manual">Ручная</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGenerateTest(false)}>
            Отмена
          </Button>
          <Button 
            variant="primary" 
            onClick={handleGenerateTest}
            disabled={
              loading.generatingTest || 
              !generationParams.test_title || 
              !generationParams.id_group || 
              !generationParams.id_topic
            }
          >
            {loading.generatingTest ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Генерация...
              </>
            ) : 'Сгенерировать тест'}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
});

export default TeacherTests;