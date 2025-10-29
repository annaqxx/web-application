import React, { useEffect, useState, useContext } from 'react';
import { 
  fetchTeacherGroups,
  fetchGroupTestResults
} from '../../http/teacherAPI';
import { Container, Table, Card, Row, Col, Form, Button, Accordion, Spinner, Alert } from 'react-bootstrap';
import { Context } from '../../index';
import { observer } from 'mobx-react-lite';

const TeacherResults = observer(() => {
  const { user } = useContext(Context);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [results, setResults] = useState([]);
  const [expandedResult, setExpandedResult] = useState(null);
  const [loading, setLoading] = useState({
    groups: false,
    results: false
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      if (!user.user?.id) {
        setError('Пользователь не авторизован');
        return;
      }

      try {
        setLoading(prev => ({...prev, groups: true}));
        setError(null);

        const groupsData = await fetchTeacherGroups(user.user.id);
        setGroups(groupsData);
      } catch (e) {
        console.error('Ошибка загрузки данных:', e);
        setError('Не удалось загрузить группы');
      } finally {
        setLoading(prev => ({...prev, groups: false}));
      }
    };

    loadInitialData();
  }, [user.user]);

  useEffect(() => {
    const loadResults = async () => {
      if (!selectedGroup) return;

      try {
        setLoading(prev => ({...prev, results: true}));
        setError(null);

        const resultsData = await fetchGroupTestResults(selectedGroup);
        setResults(resultsData);
      } catch (e) {
        console.error('Ошибка загрузки результатов:', e);
        setError('Не удалось загрузить результаты тестов');
      } finally {
        setLoading(prev => ({...prev, results: false}));
      }
    };

    loadResults();
  }, [selectedGroup]);

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
  };

  const toggleResultDetails = (studentId) => {
    setExpandedResult(prev => prev === studentId ? null : studentId);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins > 0 ? `${mins} мин ` : ''}${secs} сек`;
  };

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger" className="mt-3">
          {error}
          <div className="mt-2">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Обновить страницу
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4" style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
      <h2 className="mb-4">Результаты тестирования студентов</h2>
      
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form>
            <Row>
              <Col md={12}>
                <Form.Group controlId="groupSelect">
                  <Form.Label>Группа</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedGroup || ''}
                    onChange={handleGroupChange}
                    disabled={loading.groups || groups.length === 0}
                  >
                    <option value="">Выберите группу</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </Form.Control>
                  {loading.groups && (
                    <small className="text-muted">Загрузка групп...</small>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {loading.results ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Загрузка результатов...</p>
        </div>
      ) : selectedGroup ? (
        results.length > 0 ? (
          <Card className="shadow-sm">
            <Card.Body className="p-0">
              <Table striped bordered hover responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Студент</th>
                    <th>Тестов</th>
                    <th>Пройдено</th>
                    <th>Средний балл</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(student => (
                    <React.Fragment key={student.studentId}>
                      <tr>
                        <td>{student.studentName}</td>
                        <td>{student.results.length}</td>
                        <td>
                          {student.results.filter(r => r.passed).length} / {student.results.length}
                        </td>
                        <td>
                          {student.results.length > 0
                            ? (student.results.reduce((sum, r) => sum + r.mark, 0) / student.results.length).toFixed(1)
                            : '-'}
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => toggleResultDetails(student.studentId)}
                          >
                            {expandedResult === student.studentId ? 'Скрыть' : 'Подробнее'}
                          </Button>
                        </td>
                      </tr>
                      {expandedResult === student.studentId && (
                        <tr>
                          <td colSpan="5">
                            <Card className="mt-2 mb-2">
                              <Card.Body>
                                <h5>Детализация результатов:</h5>
                                {student.results.map((result, idx) => (
                                  <div key={idx} className="mb-3 p-2 border rounded">
                                    <div className="d-flex justify-content-between">
                                      <strong>{result.testTitle}</strong>
                                      <span>
                                        {result.passed ? (
                                          <span className="text-success">Пройден</span>
                                        ) : (
                                          <span className="text-danger">Не пройден</span>
                                        )}
                                      </span>
                                    </div>
                                    <div>Оценка: {result.mark} баллов</div>
                                    <div>Время: {formatTime(result.timeTaken)}</div>
                                    <div>Дата: {new Date(result.createdAt).toLocaleString()}</div>
                                  </div>
                                ))}
                              </Card.Body>
                            </Card>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        ) : (
          <Alert variant="info" className="text-center my-4">
            Нет результатов для выбранной группы
          </Alert>
        )
      ) : (
        <Alert variant="secondary" className="text-center my-4">
          Выберите группу для просмотра результатов
        </Alert>
      )}
    </Container>
  );
});

export default TeacherResults;