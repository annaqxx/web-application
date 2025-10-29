import React, {useState}  from 'react';
import { Container } from 'react-bootstrap';
import UserManagement from '../../components/admin/userManagment';
import AdminNavbar from '../../components/admin/adminNavbar';
import GroupsManagement from '../../components/admin/groupManagement';
import './adminDashboard.css'; // Для дополнительных стилей

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <>
      <AdminNavbar setActiveTab={setActiveTab} />
      <Container className="mt-4">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'groups' && <GroupsManagement />}
        {/* <UserManagement />
        <GroupsManagement /> */}
      </Container>
    </>
  );
}

export default AdminPage;