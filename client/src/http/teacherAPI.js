import {$authHost} from "./index";

export const logout = async () => {
  localStorage.removeItem('token');
};

export const fetchTeacherGroups = async (teacherId) => {
  const {data} = await $authHost.get(`api/userGroup/groups/${teacherId}`);
  return data;
};

// Методы для работы с материалами
export const createMaterial = async (materialData) => {
  const { data } = await $authHost.post('api/topicMaterial/materials', materialData);
  return data;
};

export const updateMaterial = async (id, materialData) => {
  const { data } = await $authHost.put(`api/topicMaterial/materials/${id}`, materialData);
  return data;
};

export const deleteMaterial = async (id) => {
  const { data } = await $authHost.delete(`api/topicMaterial/materials/${id}`);
  return data;
};


// Методы для работы с дисциплинами групп
export const addDisciplineToGroup = async (groupId, disciplineId) => {
  const { data } = await $authHost.post('api/topicMaterial/group-disciplines', {
    id_group: groupId,
    id_discipline: disciplineId
  });
  return data;
};

export const removeDisciplineFromGroup = async (groupId, disciplineId) => {
  const { data } = await $authHost.delete('api/topicMaterial/group-disciplines', {
    data: { id_group: groupId, id_discipline: disciplineId }
  });
  return data;
};

// Методы для работы с темами
export const createTopic = async (name) => { 
  const { data } = await $authHost.post('api/topicMaterial/topic', { name });
  return data;
};

export const updateTopic = async (id, name) => {
  const { data } = await $authHost.put(`api/topicMaterial/topic/${id}`, { name });
  return data;
};

export const deleteTopic = async (id) => {
  const { data } = await $authHost.delete(`api/topicMaterial/topic/${id}`);
  return data;
};

export const fetchDisciplinesByGroup = async (groupId) => {
  const { data } = await $authHost.get(`api/topicMaterial/disciplines/group/${groupId}`);
  return data;
};

export const fetchAllTopics = async () => {
  const { data } = await $authHost.get('api/topicMaterial/topic');
  return data;
};

export const fetchAllDisciplines = async () => {
  const { data } = await $authHost.get('api/topicMaterial/disciplines');
  return data;
};

// вопросы
export const createQuestion = async (questionData) => {
  const { data } = await $authHost.post('api/testQuestion/questions', questionData);
  return data;
};

export const getAllQuestions = async () => {
  const { data } = await $authHost.get('api/testQuestion/questions');
  return data;
};

export const deleteQuestion = async (id) => {
  const { data } = await $authHost.delete(`api/testQuestion/questions/${id}`);
  return data;
};

// Методы для работы с тестами
export const createTest = async (testData) => {
  const { data } = await $authHost.post('api/testQuestion/tests', testData);
  return data;
};

export const addQuestionToTest = async (testId, questionId) => {
  const { data } = await $authHost.post(`api/testQuestion/tests/${testId}/questions`, {
    id_question: questionId
  });
  return data;
};

export const removeQuestionFromTest = async (testId, questionId) => {
  const { data } = await $authHost.delete(`api/testQuestion/tests/${testId}/questions/${questionId}`, {
    data: { id_question: questionId }
  });  
  return data;
};

export const getAllTests = async () => {
  const { data } = await $authHost.get('api/testQuestion/tests');
  return data;
};

export const getTestById = async (id) => {
  const { data } = await $authHost.get(`api/testQuestion/tests/${id}`);
  return data;
};

export const updateTest = async (id, testData) => {
  const { data } = await $authHost.put(`api/testQuestion/tests/${id}`, testData);
  return data;
};

export const deleteTest = async (id) => {
  const { data } = await $authHost.delete(`api/testQuestion/tests/${id}`, {
    data: { 
      is_generated: true // Добавляем флаг, что это сгенерированный тест
    }
  });
  return data;
};

export const generateTest = async (generationData) => {
  const { data } = await $authHost.post('api/testQuestion/generate', generationData);
  return data;
};



export const fetchAllTestResults = async () => {
  const { data } = await $authHost.get('api/results/results');
  return data;
};

export const fetchGroupTestResults = async (groupId) => {
  const { data } = await $authHost.get(`api/results/results/group/${groupId}`);
  return data;
};

export const fetchTestDetails = async (testId) => {
  const { data } = await $authHost.get(`api/testQuestion/tests/${testId}`);
  return data;
};