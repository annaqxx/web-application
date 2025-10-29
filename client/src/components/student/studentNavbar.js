import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { STUDENT_ROUTE } from '../../utils/consts';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../index';
import { logout } from '../../http/studentAPI';

const StudentNavbar = observer(({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { user } = React.useContext(Context);

  const handleLogout = async () => {
    try {
      await logout();
      user.setUser({});
      user.setIsAuth(false);
      navigate(STUDENT_ROUTE);
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="admin-navbar fixed-top">
      <Container fluid> 
        <Navbar.Brand className="navbar-brand-custom">Панель студента</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              onClick={() => setActiveTab('materials')}
              className={`nav-link-custom ${activeTab === 'materials' ? 'active' : ''}`}
            >
              Учебные материалы
            </Nav.Link>
            <Nav.Link 
              onClick={() => setActiveTab('demo')}
              className={`nav-link-custom ${activeTab === 'demo' ? 'active' : ''}`}
            >
              Демонстрация
            </Nav.Link>
            <Nav.Link 
              onClick={() => setActiveTab('tests')}
              className={`nav-link-custom ${activeTab === 'tests' ? 'active' : ''}`}
            >
              Тесты
            </Nav.Link>
            <Nav.Link 
              onClick={() => setActiveTab('train')}
              className={`nav-link-custom ${activeTab === 'train' ? 'active' : ''}`}
            >
              Тренировочные тесты
            </Nav.Link>
            <Nav.Link 
              onClick={() => setActiveTab('results')}
              className={`nav-link-custom ${activeTab === 'results' ? 'active' : ''}`}
            >
              Мои результаты
            </Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link onClick={handleLogout} className="nav-link-custom">
              Выйти
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
});

export default StudentNavbar;