import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Alert, ListGroup } from 'react-bootstrap';
import { Context } from '../../index';
import { fetchTeacherGroups } from '../../http/teacherAPI';

const TeacherGroups = () => {
  const { user } = useContext(Context);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeKey, setActiveKey] = useState(null);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const data = await fetchTeacherGroups(user.user.id);
        setGroups(data);
      } catch (e) {
        setError('Ошибка при загрузке групп');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, [user.user.id]);

  const toggleAccordion = (groupId) => {
    setActiveKey(activeKey === groupId ? null : groupId);
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="mt-4">
      <h3>Мои группы</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Название группы</th>
            <th>Количество студентов</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(group => (
            <React.Fragment key={group.id}>
              <tr>
                <td>{group.id}</td>
                <td>{group.name}</td>
                <td>{group.students ? group.students.length : 0}</td>
                <td>
                  <Button 
                    variant="info" 
                    size="sm"
                    onClick={() => toggleAccordion(group.id)}
                  >
                    {activeKey === group.id ? 'Скрыть' : 'Показать'} студентов
                  </Button>
                </td>
              </tr>
              {activeKey === group.id && (
                <tr>
                  <td colSpan="4">
                    <div className="p-3">
                      <h5>Студенты группы "{group.name}"</h5>
                      <ListGroup>
                        {group.students && group.students.length > 0 ? (
                          group.students.map(student => (
                            <ListGroup.Item key={student.id}>
                              {student.last_name} {student.first_name} {student.middle_name} 
                              <span className="text-muted ml-2">({student.email})</span>
                            </ListGroup.Item>
                          ))
                        ) : (
                          <ListGroup.Item>В группе нет студентов</ListGroup.Item>
                        )}
                      </ListGroup>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TeacherGroups;