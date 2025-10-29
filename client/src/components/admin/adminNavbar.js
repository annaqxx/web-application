import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { ADMIN_ROUTE,  } from '../../utils/consts';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../index';
import { logout } from '../../http/adminAPI';
import './adminNavbar.css';

const AdminNavbar = observer(({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { user } = React.useContext(Context);

  const handleLogout = async () => {
    try {
      await logout();
      user.setUser({});
      user.setIsAuth(false);
      navigate(ADMIN_ROUTE);
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  return (
    <Navbar bg="dark" variant="red" expand="lg" className="admin-navbar fixed-top">
      <Container fluid> 
        <Navbar.Brand className="navbar-brand-custom">Админ-панель</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              onClick={() => setActiveTab('users')}
              className={`nav-link-custom ${activeTab === 'users' ? 'active' : ''}`}
            >
              Управление пользователями
            </Nav.Link>
            <Nav.Link 
              onClick={() => setActiveTab('groups')}
              className={`nav-link-custom ${activeTab === 'groups' ? 'active' : ''}`}
            >
              Управление группами
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

export default AdminNavbar;