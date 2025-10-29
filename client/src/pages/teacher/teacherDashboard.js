import React, {useState}  from 'react';
import { Container } from 'react-bootstrap';
import TeacherNavbar from '../../components/teacher/teacherNavbar';
import TeacherGroups from '../../components/teacher/teacherGroups';
import TeacherMaterials from '../../components/teacher/teacherMaterials';
import TeacherQuestions from '../../components/teacher/teacherQuestions';
import TeacherTests from '../../components/teacher/teacherTests';
import TeacherResults from '../../components/teacher/teacherResults';

const TeacherPage = () => {
  const [activeTab, setActiveTab] = useState('groups');
// activeTab,
  return (
    <>
      <Container className="mt-4">
        <TeacherNavbar setActiveTab={setActiveTab} />
        {activeTab === 'groups' && <TeacherGroups />}
        {activeTab === 'materials' && <TeacherMaterials />}
        {activeTab === 'questions' && <TeacherQuestions />}
        {activeTab === 'tests' && <TeacherTests />}
        {activeTab === 'results' && <TeacherResults />}
      </Container>
    </>
  );
}

export default TeacherPage;