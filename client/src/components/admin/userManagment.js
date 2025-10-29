import React, { useEffect, useState } from 'react';
// import { Context } from '../../index';
import { fetchUsers, createUser, updateUser, deleteUser,  } from '../../http/adminAPI';
import { Button, Table, Form, Modal } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';

const UserManagement = observer(() => {

  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student',
    first_name: '',
    last_name: '',
    middle_name: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error('Ошибка при загрузке пользователей:', error);
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
    if (!formData.email) newErrors.email = 'Email обязателен';
    if (!formData.first_name) newErrors.first_name = 'Имя обязательно';
    if (!formData.last_name) newErrors.last_name = 'Фамилия обязательна';
    if (!editingUser && !formData.password) newErrors.password = 'Пароль обязателен';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
      } else {
        await createUser(formData);
      }
      setShowModal(false);
      loadUsers();
      resetForm();
    } catch (error) {
      console.error('Ошибка при сохранении пользователя:', error);
      setErrors({ submit: error.response?.data?.message || 'Ошибка при сохранении' });
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      middle_name: user.middle_name || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      try {
        await deleteUser(id);
        loadUsers();
      } catch (error) {
        console.error('Ошибка при удалении пользователя:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      role: 'student',
      first_name: '',
      last_name: '',
      middle_name: ''
    });
    setEditingUser(null);
    setErrors({});
  };

  return (
    <div className="container mt-4">
      <div className="bg-white sticky-top py-3 mb-3" style={{ top: '70px', zIndex: 1000, borderBottom: '1px solid #dee2e6' }}>
        <div className="d-flex justify-content-between align-items-center">
          <br></br>
          <Button 
            variant="primary"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            Добавить пользователя
          </Button>
        </div>
      </div>

      <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/>


      <Table striped bordered hover className="mt-3" style={{paddingTop: '1000px'}}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Роль</th>
            <th>ФИО</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>
                {user.role === 'admin' && 'Администратор'}
                {user.role === 'teacher' && 'Преподаватель'}
                {user.role === 'student' && 'Студент'}
              </td>
              <td>{`${user.last_name} ${user.first_name} ${user.middle_name || ''}`}</td>
              <td>
                <Button 
                  variant="warning" 
                  size="sm" 
                  onClick={() => handleEdit(user)}
                  className="me-2"
                >
                  Редактировать
                </Button>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => handleDelete(user.id)}
                >
                  Удалить
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                isInvalid={!!errors.password}
                placeholder={editingUser ? "Оставьте пустым, если не хотите менять" : ""}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Роль</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="student">Студент</option>
                <option value="teacher">Преподаватель</option>
                <option value="admin">Администратор</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Фамилия</Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                isInvalid={!!errors.last_name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.last_name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Имя</Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                isInvalid={!!errors.first_name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.first_name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Отчество (необязательно)</Form.Label>
              <Form.Control
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleInputChange}
              />
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

export default UserManagement;