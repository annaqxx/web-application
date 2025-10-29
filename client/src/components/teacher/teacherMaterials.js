import React, { useState, useEffect, useContext } from 'react';
import { Container, Table, Button, Form, Modal, Alert, Row, Col, Tab, Tabs } from 'react-bootstrap';
import { Context } from '../../index';
import {$authHost} from '../../http/'
import { 
  fetchTeacherGroups, 
  createMaterial,
  updateMaterial,
  deleteMaterial,
  addDisciplineToGroup,
  removeDisciplineFromGroup,
  createTopic,
  updateTopic,
  deleteTopic,
  fetchDisciplinesByGroup,
  fetchAllDisciplines,
  fetchAllTopics
} from '../../http/teacherAPI';

const TeacherMaterials = () => {
  const { user } = useContext(Context);
  const [groups, setGroups] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('materials');
  
  // Состояния для материалов
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    id: '',
    id_group: '',
    id_discipline: '',
    id_topic: '',
    content: '',
    resource_type: 'text'
  });
  
  // Состояния для дисциплин групп
  const [showDisciplineModal, setShowDisciplineModal] = useState(false);
  const [groupDisciplineForm, setGroupDisciplineForm] = useState({
    id_group: '',
    id_discipline: ''
  });
  
  // Состояния для тем
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [topicForm, setTopicForm] = useState({
    id: '',
    name: ''
  });
  
  const [disciplines, setDisciplines] = useState([]);
  const [allDisciplines, setAllDisciplines] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [groupsData, disciplinesData, topicsData] = await Promise.all([
          fetchTeacherGroups(user.user.id),
          fetchAllDisciplines(),
          fetchAllTopics()
        ]);
        setGroups(groupsData);
        setAllDisciplines(disciplinesData);
        setTopics(topicsData);
        setLoading(false);
      } catch (e) {
        setError('Ошибка при загрузке данных');
        console.error(e);
        setLoading(false);
      }
    };
    loadInitialData();
  }, [user.user.id]);

  const handleGroupSelect = async (groupId) => {
    setSelectedGroup(groupId);
    try {
      const [disciplinesData, materialsData] = await Promise.all([
        fetchDisciplinesByGroup(groupId),
        $authHost.get(`api/topicMaterial/materials/group/${groupId}`)
      ]);
      setDisciplines(disciplinesData);
      setMaterials(materialsData.data);
    } catch (e) {
      console.error('Ошибка загрузки:', e);
    }
  };

  // Обработчики для материалов
  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    try {
      if (materialForm.id) {
        // Редактирование существующего материала
        const updatedMaterial = await updateMaterial(materialForm.id, {
          content: materialForm.content,
          resource_type: materialForm.resource_type
        });
        setMaterials(materials.map(m => m.id === updatedMaterial.id ? updatedMaterial : m));
      } else {
        // Создание нового материала
        const newMaterial = await createMaterial({
          ...materialForm,
          teacher_id: user.user.id
        });
        setMaterials([...materials, newMaterial]);
      }
      setShowMaterialModal(false);
      setMaterialForm({
        id: '',
        id_group: '',
        id_discipline: '',
        id_topic: '',
        content: '',
        resource_type: 'text'
      });
    } catch (e) {
      console.error('Ошибка сохранения материала:', e);
      setError('Ошибка при сохранении материала');
    }
  };

  const handleEditMaterial = (material) => {
    setMaterialForm({
      id: material.id,
      id_group: material.id_group,
      id_discipline: material.id_discipline,
      id_topic: material.id_topic,
      content: material.content,
      resource_type: material.resource_type
    });
    setShowMaterialModal(true);
  };

  const handleDeleteMaterial = async (id) => {
    try {
      await deleteMaterial(id);
      setMaterials(materials.filter(m => m.id !== id));
    } catch (e) {
      console.error('Ошибка удаления материала:', e);
      setError('Ошибка при удалении материала');
    }
  };

  const handleViewMaterial = (material) => {
    setSelectedMaterial(material);
  };

  // Обработчики для дисциплин групп
  const handleAddDiscipline = async (e) => {
    e.preventDefault();
    try {
      await addDisciplineToGroup(groupDisciplineForm.id_group, groupDisciplineForm.id_discipline);
      const updatedDisciplines = await fetchDisciplinesByGroup(groupDisciplineForm.id_group);
      setDisciplines(updatedDisciplines);
      setShowDisciplineModal(false);
    } catch (e) {
      console.error('Ошибка добавления дисциплины:', e);
      setError('Ошибка при добавлении дисциплины');
    }
  };

  const handleRemoveDiscipline = async (disciplineId) => {
    try {
      await removeDisciplineFromGroup(selectedGroup, disciplineId);
      const updatedDisciplines = await fetchDisciplinesByGroup(selectedGroup);
      setDisciplines(updatedDisciplines);
    } catch (e) {
      console.error('Ошибка удаления дисциплины:', e);
      setError('Ошибка при удалении дисциплины');
    }
  };

  // Обработчики для тем
  const handleTopicSubmit = async (e) => {
    e.preventDefault();
    try {
      if (topicForm.id) {
        await updateTopic(topicForm.id, topicForm.name);
      } else {
        await createTopic(topicForm.name);
      }
      const updatedTopics = await fetchAllTopics();
      setTopics(updatedTopics);
      setShowTopicModal(false);
      setTopicForm({ id: '', name: '' });
    } catch (e) {
      console.error('Ошибка сохранения темы:', e);
      setError('Ошибка при сохранении темы');
    }
  };

  const handleEditTopic = (topic) => {
    setTopicForm({
      id: topic.id,
      name: topic.name
    });
    setShowTopicModal(true);
  };

  const handleDeleteTopic = async (id) => {
    try {
      await deleteTopic(id);
      const updatedTopics = await fetchAllTopics();
      setTopics(updatedTopics);
    } catch (e) {
      console.error('Ошибка удаления темы:', e);
      setError('Ошибка при удалении темы');
    }
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="mt-4" style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
    {/* Заголовок и выбор группы - фиксированные */}
    <div style={{ flexShrink: 0 }}>
      <Row className="mb-3">
        <Col>
          <h3>Управление учебными материалами</h3>
          <Form.Select 
            className="mb-3"
            onChange={(e) => handleGroupSelect(e.target.value)}
            value={selectedGroup || ''}
          >
            <option value="">Выберите группу</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>
    </div>

      
      {selectedGroup && (
        <>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="materials" title="Материалы">
              <div className="mb-4">
                <Button 
                  variant="primary" 
                  className="mb-3"
                  onClick={() => {
                    setMaterialForm({
                      id: '',
                      id_group: selectedGroup,
                      id_discipline: '',
                      id_topic: '',
                      content: '',
                      resource_type: 'text'
                    });
                    setShowMaterialModal(true);
                  }}
                >
                  Добавить материал
                </Button>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Дисциплина</th>
                      <th>Тема</th>
                      <th>Тип</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map(material => {
                      const discipline = disciplines.find(d => d.id === material.id_discipline);
                      const topic = topics.find(t => t.id === material.id_topic);
                      return (
                        <tr key={material.id}>
                          <td>{discipline?.name || 'Неизвестно'}</td>
                          <td>{topic?.name || 'Неизвестно'}</td>
                          <td>
                            {material.resource_type === 'text' && 'Текст'}
                            {material.resource_type === 'video' && 'Видео'}
                            {material.resource_type === 'img' && 'Изображение'}
                            {material.resource_type === 'pdf' && 'PDF'}
                            {material.resource_type === 'url' && 'Ссылка'}
                            {material.resource_type === 'document' && 'Документ'}
                          </td>
                          <td>
                            <Button 
                              variant="info" 
                              size="sm" 
                              className="me-2"
                              onClick={() => handleViewMaterial(material)}
                            >
                              Просмотр
                            </Button>
                            <Button 
                              variant="warning" 
                              size="sm" 
                              className="me-2"
                              onClick={() => handleEditMaterial(material)}
                            >
                              Редактировать
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleDeleteMaterial(material.id)}
                            >
                              Удалить
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Tab>
            
            <Tab eventKey="disciplines" title="Дисциплины группы">
              <div className="mb-4">
                <Button 
                  variant="success" 
                  className="mb-3"
                  onClick={() => {
                    setGroupDisciplineForm({
                      id_group: selectedGroup,
                      id_discipline: ''
                    });
                    setShowDisciplineModal(true);
                  }}
                >
                  Добавить дисциплину
                </Button>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Название</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disciplines.map(discipline => (
                      <tr key={discipline.id}>
                        <td>{discipline.name}</td>
                        <td>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleRemoveDiscipline(discipline.id)}
                          >
                            Удалить
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Tab>
            
            <Tab eventKey="topics" title="Темы">
              <div className="mb-4">
                <Button 
                  variant="info" 
                  className="mb-3"
                  onClick={() => {
                    setTopicForm({id: '', name: ''});
                    setShowTopicModal(true);
                  }}
                >
                  Добавить тему
                </Button>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Название</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topics.map(topic => (
                      <tr key={topic.id}>
                        <td>{topic.name}</td>
                        <td>
                          <Button 
                            variant="warning" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleEditTopic(topic)}
                          >
                            Редактировать
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleDeleteTopic(topic.id)}
                          >
                            Удалить
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Tab>
          </Tabs>
        </>
      )}

      {/* Модальные окна */}
      <MaterialModal 
        show={showMaterialModal} 
        onHide={() => {
          setShowMaterialModal(false);
          setMaterialForm({
            id: '',
            id_group: '',
            id_discipline: '',
            id_topic: '',
            content: '',
            resource_type: 'text'
          });
        }}
        onSubmit={handleMaterialSubmit}
        formData={materialForm}
        setFormData={setMaterialForm}
        groups={groups}
        disciplines={disciplines}
        topics={topics}
        selectedGroup={selectedGroup}
      />

      <DisciplineModal 
        show={showDisciplineModal}
        onHide={() => setShowDisciplineModal(false)}
        onSubmit={handleAddDiscipline}
        formData={groupDisciplineForm}
        setFormData={setGroupDisciplineForm}
        groups={groups}
        allDisciplines={allDisciplines}
        selectedGroup={selectedGroup}
        disciplines={disciplines}
      />

      <TopicModal 
        show={showTopicModal}
        onHide={() => {
          setShowTopicModal(false);
          setTopicForm({id: '', name: ''});
        }}
        onSubmit={handleTopicSubmit}
        formData={topicForm}
        setFormData={setTopicForm}
      />

      {/* Модальное окно просмотра материала */}
      <Modal 
        show={!!selectedMaterial} 
        onHide={() => setSelectedMaterial(null)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Просмотр материала</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMaterial && (
            <div>
              <h5>Дисциплина: {disciplines.find(d => d.id === selectedMaterial.id_discipline)?.name || 'Неизвестно'}</h5>
              <h5>Тема: {topics.find(t => t.id === selectedMaterial.id_topic)?.name || 'Неизвестно'}</h5>
              <h5>Тип: 
                {selectedMaterial.resource_type === 'text' && ' Текст'}
                {selectedMaterial.resource_type === 'video' && ' Видео'}
                {selectedMaterial.resource_type === 'img' && ' Изображение'}
                {selectedMaterial.resource_type === 'pdf' && ' PDF'}
                {selectedMaterial.resource_type === 'url' && ' Ссылка'}
                {selectedMaterial.resource_type === 'document' && ' Документ'}
              </h5>
              <hr />
              {selectedMaterial.resource_type === 'text' && (
                <div style={{whiteSpace: 'pre-wrap'}}>{selectedMaterial.content}</div>
              )}
              {selectedMaterial.resource_type === 'video' && (
                <div className="ratio ratio-16x9">
                  <iframe 
                    src={selectedMaterial.content} 
                    title="Видео материал" 
                    allowFullScreen
                  />
                </div>
              )}
              {selectedMaterial.resource_type === 'img' && (
                <div className="text-center">
                  <img 
                    src={selectedMaterial.content} 
                    alt="Изображение" 
                    style={{maxWidth: '100%', maxHeight: '500px'}}
                  />
                </div>
              )}
              {(selectedMaterial.resource_type === 'pdf' || 
                selectedMaterial.resource_type === 'document') && (
                <embed 
                  src={selectedMaterial.content} 
                  width="100%" 
                  height="500px" 
                  type="application/pdf"
                />
              )}
              {selectedMaterial.resource_type === 'url' && (
                <a 
                  href={selectedMaterial.content} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {selectedMaterial.content}
                </a>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedMaterial(null)}>
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

// Вынесенные компоненты модальных окон
const MaterialModal = ({ 
  show, 
  onHide, 
  onSubmit, 
  formData, 
  setFormData, 
  groups, 
  disciplines, 
  topics,
  selectedGroup
}) => (
  <Modal show={show} onHide={onHide} size="lg">
    <Modal.Header closeButton>
      <Modal.Title>{formData.id ? 'Редактировать' : 'Добавить'} материал</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Группа</Form.Label>
          <Form.Select
            name="id_group"
            value={selectedGroup || formData.id_group}
            onChange={(e) => setFormData({...formData, id_group: e.target.value})}
            required
            disabled={!!selectedGroup}
          >
            <option value="">Выберите группу</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Дисциплина</Form.Label>
          <Form.Select
            name="id_discipline"
            value={formData.id_discipline}
            onChange={(e) => setFormData({...formData, id_discipline: e.target.value})}
            required
          >
            <option value="">Выберите дисциплину</option>
            {disciplines.map(discipline => (
              <option key={discipline.id} value={discipline.id}>{discipline.name}</option>
            ))}
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Тема</Form.Label>
          <Form.Select
            name="id_topic"
            value={formData.id_topic}
            onChange={(e) => setFormData({...formData, id_topic: e.target.value})}
            required
          >
            <option value="">Выберите тему</option>
            {topics.map(topic => (
              <option key={topic.id} value={topic.id}>{topic.name}</option>
            ))}
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Тип материала</Form.Label>
          <Form.Select
            name="resource_type"
            value={formData.resource_type}
            onChange={(e) => setFormData({...formData, resource_type: e.target.value})}
            required
          >
            <option value="text">Текст</option>
            <option value="video">Видео</option>
            <option value="img">Изображение</option>
            <option value="pdf">PDF</option>
            <option value="url">Ссылка</option>
            <option value="document">Документ</option>
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Содержание</Form.Label>
          {formData.resource_type === 'text' && (
            <Form.Control
              as="textarea"
              rows={5}
              name="content"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              required
            />
          )}
          {(formData.resource_type === 'video' || 
            formData.resource_type === 'img' || 
            formData.resource_type === 'pdf' ||
            formData.resource_type === 'document' ||
            formData.resource_type === 'url') && (
            <Form.Control
              type="text"
              name="content"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder={`Введите URL или путь к ${formData.resource_type === 'video' ? 'видео' : 
                          formData.resource_type === 'img' ? 'изображению' : 
                          formData.resource_type === 'pdf' ? 'PDF файлу' : 
                          formData.resource_type === 'document' ? 'документу' : 'ссылке'}`}
              required
            />
          )}
        </Form.Group>
        
        <Button type="submit" className="me-2">Сохранить</Button>
        <Button variant="secondary" onClick={onHide}>Отмена</Button>
      </Form>
    </Modal.Body>
  </Modal>
);

const DisciplineModal = ({ 
  show, 
  onHide, 
  onSubmit, 
  formData, 
  setFormData, 
  groups, 
  allDisciplines, 
  selectedGroup,
  disciplines 
}) => (
  <Modal show={show} onHide={onHide}>
    <Modal.Header closeButton>
      <Modal.Title>Добавить дисциплину в группу</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Группа</Form.Label>
          <Form.Select
            name="id_group"
            value={selectedGroup || formData.id_group}
            onChange={(e) => setFormData({...formData, id_group: e.target.value})}
            required
            disabled={!!selectedGroup}
          >
            <option value="">Выберите группу</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Дисциплина</Form.Label>
          <Form.Select
            name="id_discipline"
            value={formData.id_discipline}
            onChange={(e) => setFormData({...formData, id_discipline: e.target.value})}
            required
          >
            <option value="">Выберите дисциплину</option>
            {allDisciplines
              .filter(d => !disciplines.some(dd => dd.id === d.id))
              .map(discipline => (
                <option key={discipline.id} value={discipline.id}>{discipline.name}</option>
              ))}
          </Form.Select>
        </Form.Group>
        <Button type="submit" className="me-2">Добавить</Button>
        <Button variant="secondary" onClick={onHide}>Отмена</Button>
      </Form>
    </Modal.Body>
  </Modal>
);

const TopicModal = ({ show, onHide, onSubmit, formData, setFormData }) => (
  <Modal show={show} onHide={onHide}>
    <Modal.Header closeButton>
      <Modal.Title>{formData.id ? 'Редактировать' : 'Добавить'} тему</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Название темы</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </Form.Group>
        <Button type="submit" className="me-2">Сохранить</Button>
        <Button variant="secondary" onClick={onHide}>Отмена</Button>
      </Form>
    </Modal.Body>
  </Modal>
);

export default TeacherMaterials;