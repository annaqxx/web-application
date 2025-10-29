import {$authHost} from "./index";

export const logout = async () => {
  localStorage.removeItem('token');
};

export const fetchStudentGroup = async () => {
  const { data } = await $authHost.get('api/userGroup/group');
  return data;
};

// Материалы
export const fetchAllMaterials = async () => {
  const { data } = await $authHost.get('api/topicMaterial/materials');
  return data;
};

export const fetchMaterialsByGroup = async (groupId) => {
  const { data } = await $authHost.get(`api/topicMaterial/materials/group/${groupId}`);
  return data;
};

export const fetchMaterialsByDiscipline = async (disciplineId) => {
  const { data } = await $authHost.get(`api/materials/discipline/${disciplineId}`);
  return data;
};

export const fetchMaterialsByTopic = async (topicId) => {
  const { data } = await $authHost.get(`api/topicMaterial/materials/topic/${topicId}`);
  return data;
};

export const fetchDisciplinesByGroup = async (groupId) => {
  const { data } = await $authHost.get(`api/topicMaterial/disciplines/group/${groupId}`);
  return data;
};

export const fetchTopicsByDiscipline = async (disciplineId) => {
  const { data } = await $authHost.get(`api/topicMaterial/topic/disciplines/${disciplineId}`);
  return data;
};

export const fetchTestsByGroup = async (groupId) => {
  const { data } = await $authHost.get(`api/testQuestion/tests/group/${groupId}?is_training=false`);
  return data;
}

export const getTestForStudent = async (testId) => {
    const { data } = await $authHost.get(`api/testQuestion/student/tests/${testId}`);
    return data;
};

export const startTest = async (testId) => {
    const { data } = await $authHost.post('api/testQuestion/start', { testId });
    return data;
};

export const submitTest = async (resultId, answers, timeTaken) => {
    const { data } = await $authHost.post('api/testQuestion/submit', { 
        resultId, 
        answers, 
        timeTaken 
    });
    return data;
};

export const getStudentResults = async () => {
    const { data } = await $authHost.get('api/results/student/results');
    return data;
};

// тренировочные тесты
export const fetchTrainingTests = async () => {
    const {data} = await $authHost.get('api/testQuestion/student/train')
    return data
}

export const getTrainingTest = async (testId) => {
    const {data} = await $authHost.get(`api/testQuestion/student/train/${testId}`)
    return data
}

export const submitTrainingTest = async (testId, answers) => {
    const {data} = await $authHost.post(`api/testQuestion/student/train/${testId}/submit`, {answers})
    return data
}