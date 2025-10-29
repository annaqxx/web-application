import {$authHost} from "./index";


export const logout = async () => {
  localStorage.removeItem('token');
};

export const fetchUsers = async () => {
  const {data} = await $authHost.get('api/userGroup/users');
  return data;
};

export const createUser = async (userData) => {
  const {data} = await $authHost.post('api/userGroup/users', userData);
  return data;
};

export const updateUser = async (id, userData) => {
  const {data} = await $authHost.put(`api/userGroup/users/${id}`, userData);
  return data;
};

export const deleteUser = async (id) => {
  const {data} = await $authHost.delete(`api/userGroup/users/${id}`);
  return data;
};

export const fetchGroups = async () => {
  const {data} = await $authHost.get('api/userGroup/groups');
  return data;
};

export const createGroup = async (groupData) => {
  const {data} = await $authHost.post('api/userGroup/groups', groupData);
  return data;
};

export const fetchStudents = async () => {
  const {data} = await $authHost.get('api/userGroup/students');
  return data;
};

export const createStudent = async (studentData) => {
  const {data} = await $authHost.post('api/userGroup/students', studentData);
  return data;
};

export const fetchTeachers = async () => {
  const {data} = await $authHost.get('api/userGroup/teachers');
  return data;
};

export const updateGroup = async (id, groupData) => {
  const {data} = await $authHost.put(`api/userGroup/groups/${id}`, groupData);
  return data;
};

export const deleteGroup = async (id) => {
  const {data} = await $authHost.delete(`api/userGroup/groups/${id}`);
  return data;
};

export const addUserToGroup = async (groupId, userId) => {
  const {data} = await $authHost.post(`api/userGroup/groups/${groupId}/users/${userId}`);
  return data;
};

export const removeUserFromGroup = async (groupId, userId) => {
  const {data} = await $authHost.delete(`api/userGroup/groups/${groupId}/users/${userId}`);
  return data;
};
