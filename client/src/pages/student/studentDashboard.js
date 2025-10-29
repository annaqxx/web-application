import React, {useState} from 'react';
import { Container } from 'react-bootstrap';
import StudentNavbar from '../../components/student/studentNavbar';
import StudentMaterials from '../../components/student/studentMaterials'
import StudentDemo from '../../components/student/studentDemo';
import StudentTests from '../../components/student/studentTest';
import StudentTestTrain from '../../components/student/studentTestTrain';
import StudentResult from '../../components/student/studentResult';

const StudentPage = () => {
  const [activeTab, setActiveTab] = useState('materials');
  return (
    <>
      <Container className="mt-4">
        <StudentNavbar setActiveTab={setActiveTab}/>
        {activeTab === 'materials' && <StudentMaterials />}
        {activeTab === 'demo' && <StudentDemo />}
        {activeTab === 'tests' && <StudentTests />}
        {activeTab === 'train' && <StudentTestTrain />}
        {activeTab === 'results' && <StudentResult />}
      </Container>
    </>
  );
};

export default StudentPage;