import {$authHost, $host} from "./index";
import { jwtDecode } from "jwt-decode";

export const login = async (email, password) => {
    const {data} = await $host.post('api/auth/login', {email, password})
    localStorage.setItem('token', data.token)
    return jwtDecode(data.token)
}

export const check = async () => {
    const {data} = await $authHost.get('api/auth/auth')
    localStorage.setItem('token', data.token)
    return jwtDecode(data.token)
}

// export const logout = async () => {
//   localStorage.removeItem('token');
// };

// export const fetchUsers = async () => {
//   const { data } = await $authHost.get('api/userGroup/users');
//   return data;
// };

// export const createUser = async (userData) => {
//   const { data } = await $authHost.post('api/userGroup/users', userData);
//   return data;
// };

// export const updateUser = async (id, userData) => {
//   const { data } = await $authHost.put(`api/userGroup/users/${id}`, userData);
//   return data;
// };

// export const deleteUser = async (id) => {
//   const { data } = await $authHost.delete(`api/userGroup/users/${id}`);
//   return data;
// };
