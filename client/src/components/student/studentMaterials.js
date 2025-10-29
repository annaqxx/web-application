import React, { useEffect, useState } from 'react';
import { 
  fetchMaterialsByGroup, 
  fetchDisciplinesByGroup,
  fetchStudentGroup,
  fetchTopicsByDiscipline // Нужно добавить этот метод в API
} from '../../http/studentAPI';

const StudentMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [groupId, setGroupId] = useState(null);

  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    fetchStudentData();
  }, []);

  useEffect(() => {
    if (selectedDiscipline !== 'all' && selectedDiscipline) {
      fetchTopicsForDiscipline(selectedDiscipline);
    } else {
      setTopics([]);
    }
  }, [selectedDiscipline]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // 1. Получаем группу студента
      const groupData = await fetchStudentGroup();
      const currentGroupId = groupData.id_group;
      setGroupId(currentGroupId);
      
      if (!currentGroupId) {
        console.warn('Студент не состоит ни в одной группе');
        return;
      }
      
      // 2. Получаем дисциплины группы
      const disciplinesData = await fetchDisciplinesByGroup(currentGroupId);
      setDisciplines(disciplinesData);
      
      // 3. Получаем материалы группы
      const materialsData = await fetchMaterialsByGroup(currentGroupId);
      setMaterials(materialsData);
      
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicsForDiscipline = async (disciplineId) => {
    try {
      // Если выбрано "Все дисциплины", показываем все темы из всех материалов
      if (disciplineId === 'all') {
        const uniqueTopics = new Map();
        materials.forEach(m => {
          if (m.Topic) {
            uniqueTopics.set(m.Topic.id, m.Topic);
          }
        });
        setTopics(Array.from(uniqueTopics.values()));
        return;
      }
      
      // Иначе загружаем темы для конкретной дисциплины
      const topicsData = await fetchTopicsByDiscipline(disciplineId);
      setTopics(topicsData);
    } catch (error) {
      console.error('Ошибка при загрузке тем:', error);
    }
  };

  // Фильтрация материалов
  const filteredMaterials = materials.filter(material => {
    const matchesDiscipline = selectedDiscipline === 'all' || material.id_discipline == selectedDiscipline;
    const matchesTopic = selectedTopic === 'all' || material.id_topic == selectedTopic;
    return matchesDiscipline && matchesTopic ;
  });

  const resetFilters = () => {
    setSelectedDiscipline('all');
    setSelectedTopic('all');
  };

  const openModal = (content) => {
    setModalContent(content);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalContent(null);
    document.body.style.overflow = 'auto';
  };

  // Обработчик нажатия ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    if (modalContent) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalContent]);

  return (
    <div style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
      <h1>Учебные материалы</h1>
      
      {groupId && (
        <div style={{ marginBottom: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
          <p>
            <strong>Группа ID:</strong> {groupId} | 
            <strong> Материалов:</strong> {materials.length} | 
            <strong> Дисциплин:</strong> {disciplines.length} |
            <strong> Тем:</strong> {topics.length}
          </p>
        </div>
      )}
      
      <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <select
          value={selectedDiscipline}
          onChange={(e) => {
            setSelectedDiscipline(e.target.value);
            setSelectedTopic('all'); // Сбрасываем выбор темы при смене дисциплины
          }}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="all">Все дисциплины</option>
          {disciplines.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          disabled={!selectedDiscipline || selectedDiscipline === 'all'}
        >
          <option value="all">Все темы</option>
          {topics.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <button 
          onClick={resetFilters}
          style={{ padding: '8px 16px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
        >
          Сбросить фильтры
        </button>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Загрузка материалов...</p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', background: '#f9f9f9', borderRadius: '4px' }}>
          <p>{materials.length === 0 ? 
            "Для вашей группы пока нет учебных материалов" : 
            "Материалы не найдены по выбранным фильтрам"}</p>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredMaterials.map(material => (
              <div key={material.id} style={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: '8px', 
                padding: '16px', 
                background: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                height: '100%'
              }}>
                <h3 style={{ marginTop: '0', color: '#333' }}>
                  {material.Discipline?.name || 'Без дисциплины'} - {material.Topic?.name || 'Без темы'}
                </h3>
                <p style={{ color: '#666', marginBottom: '10px' }}>
                  <strong>Тип:</strong> {material.resource_type}
                </p>
                
                {material.resource_type === 'text' ? (
                  <>
                    <div 
                      style={{ 
                        marginTop: '10px',
                        maxHeight: '150px',
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: 'pointer',
                        border: '1px solid #eee',
                        padding: '8px',
                        borderRadius: '4px'
                      }}
                      onClick={() => openModal(material.content)}
                    >
                      <div dangerouslySetInnerHTML={{ __html: material.content }} />
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '30px',
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1))'
                      }}></div>
                    </div>
                    <button 
                      onClick={() => openModal(material.content)}
                      style={{
                        marginTop: '10px',
                        padding: '5px 10px',
                        background: '#f0f0f0',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Читать полностью
                    </button>
                  </>
                ) : material.resource_type === 'url' ? (
                  <a 
                    href={material.content} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'inline-block', 
                      padding: '8px 16px', 
                      background: '#007bff', 
                      color: 'white', 
                      borderRadius: '4px', 
                      textDecoration: 'none',
                      marginTop: '10px'
                    }}
                  >
                    Перейти по ссылке
                  </a>
                ) : (
                  <a 
                    href={`${process.env.REACT_APP_API_URL}/static/${material.content}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'inline-block', 
                      padding: '8px 16px', 
                      background: '#007bff', 
                      color: 'white', 
                      borderRadius: '4px', 
                      textDecoration: 'none',
                      marginTop: '10px'
                    }}
                  >
                    Скачать файл
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Модальное окно для полного просмотра текста */}
      {modalContent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '80%',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto',
            padding: '40px 20px 20px', // Увеличили верхний padding для крестика
            position: 'relative' // Добавляем для позиционирования крестика
          }}>
            <button 
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                width: '30px',
                height: '30px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#666',
                '&:hover': {
                  color: '#333'
                }
              }}
            >
              ×
            </button>
            <div dangerouslySetInnerHTML={{ __html: modalContent }} />
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentMaterials;