import { api } from '../../shared/api.js';

document.getElementById('logout-btn').addEventListener('click', () => {
    api.logout();
});