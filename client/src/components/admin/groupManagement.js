import React, { useEffect, useState } from 'react';
import { 
  fetchGroups, 
  createGroup, 
  updateGroup, 
  deleteGroup, 
  fetchUsers,
  fetchStudents, // Добавлен импорт fetchStudents
  addUserToGroup, // Добавлен импорт addUserToGroup
  removeUserFromGroup // Добавлен импорт removeUserFromGroup
} from '../../http/adminAPI';
import { Button, Table, Form, Modal } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';

const GroupsManagement = observer(() => {
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]); // Добавлено состояние для студентов
  const [availableStudents, setAvailableStudents] = useState([]); // Добавлено состояние для доступных студентов
  const [showModal, setShowModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false); // Добавлено состояние для модального окна студентов
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null); // Добавлено состояние для выбранной группы
  const [formData, setFormData] = useState({
    name: '',
    teacher_id: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadGroups();
    loadTeachers();
    loadStudents(); // Добавлена загрузка студентов
  }, []);

  const loadGroups = async () => {
    try {
      const data = await fetchGroups();
      setGroups(data);
    } catch (error) {
      console.error('Ошибка при загрузке групп:', error);
    }
  };

  const loadTeachers = async () => {
    try {
      const users = await fetchUsers();
      const teachers = users.filter(user => user.role === 'teacher');
      setTeachers(teachers);
    } catch (error) {
      console.error('Ошибка при загрузке преподавателей:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const data = await fetchStudents(); // Используем импортированную функцию
      setStudents(data);
    } catch (error) {
      console.error('Ошибка при загрузке студентов:', error);
    }
  };

  const handleAddStudent = async (groupId, studentId) => {
    try {
      await addUserToGroup(groupId, studentId); // Используем импортированную функцию
      loadGroups();
    } catch (error) {
      console.error('Ошибка при добавлении студента:', error);
    }
  };

  const handleRemoveStudent = async (groupId, studentId) => {
    try {
      await removeUserFromGroup(groupId, studentId); // Используем импортированную функцию
      loadGroups();
    } catch (error) {
      console.error('Ошибка при удалении студента:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Название группы обязательно';
    if (!formData.teacher_id) newErrors.teacher_id = 'Преподаватель обязателен';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingGroup) {
        await updateGroup(editingGroup.id, formData);
      } else {
        await createGroup(formData);
      }
      setShowModal(false);
      await loadGroups();
      resetForm();
    } catch (error) {
      console.error('Ошибка при сохранении группы:', error);
      setErrors({ submit: error.response?.data?.message || 'Ошибка при сохранении' });
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      teacher_id: group.teacher_id
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту группу?')) {
      try {
        await deleteGroup(id);
        loadGroups();
      } catch (error) {
        console.error('Ошибка при удалении группы:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      teacher_id: ''
    });
    setEditingGroup(null);
    setErrors({});
  };

  return (
    <div className="container mt-4">
      <Button 
        variant="primary" 
        onClick={() => {
          resetForm();
          setShowModal(true);
        }}
        className="mb-3"
      >
        Добавить группу
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Преподаватель</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(group => {
            const teacher = teachers.find(t => t.id === group.teacher_id);
            return (
              <tr key={group.id}>
                <td>{group.id}</td>
                <td>{group.name}</td>
                <td>{teacher ? `${teacher.last_name} ${teacher.first_name}` : 'Не назначен'}</td>
                <td>
                  <Button 
                    variant="warning" 
                    size="sm" 
                    onClick={() => handleEdit(group)}
                    className="me-2"
                  >
                    Редактировать
                  </Button>
                  <Button 
                    variant="info" 
                    size="sm" 
                    onClick={() => {
                      setSelectedGroup(group.id);
                      const groupStudents = group.students?.map(s => s.id) || [];
                      setAvailableStudents(students.filter(s => !groupStudents.includes(s.id)));
                      setShowStudentModal(true);
                    }}
                    className="me-2"
                  >
                    Управление студентами
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => handleDelete(group.id)}
                  >
                    Удалить
                  </Button>
              </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <Modal show={showStudentModal} onHide={() => setShowStudentModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Управление студентами группы</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Добавить студента</h5>
          <Form.Select 
            onChange={(e) => {
              if (e.target.value) {
                handleAddStudent(selectedGroup, e.target.value);
                e.target.value = ""; // Сбрасываем выбор
              }
            }}
          >
            <option value="">Выберите студента для добавления</option>
            {availableStudents.map(student => (
              <option key={student.id} value={student.id}>
                {student.last_name} {student.first_name}
              </option>
            ))}
          </Form.Select>
          
          <h5 className="mt-4">Студенты в группе</h5>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Фамилия</th>
                <th>Имя</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {groups.find(g => g.id === selectedGroup)?.students?.map(student => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.last_name}</td>
                  <td>{student.first_name}</td>
                  <td>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleRemoveStudent(selectedGroup, student.id)}
                    >
                      Удалить
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingGroup ? 'Редактировать группу' : 'Добавить группу'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Название группы</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Преподаватель</Form.Label>
              <Form.Select
                name="teacher_id"
                value={formData.teacher_id}
                onChange={handleInputChange}
                isInvalid={!!errors.teacher_id}
              >
                <option value="">Выберите преподавателя</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.last_name} {teacher.first_name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.teacher_id}
              </Form.Control.Feedback>
            </Form.Group>

            {errors.submit && (
              <div className="alert alert-danger">{errors.submit}</div>
            )}

            <Button variant="primary" type="submit">
              Сохранить
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
});

export default GroupsManagement;