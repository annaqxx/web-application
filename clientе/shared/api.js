const API_BASE_URL = 'http://localhost:5000/api';

async function makeRequest(url, method = 'GET', data = null, token = null) {
    const headers = {
        'Content-Type': 'application/json',
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, config);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Request failed');
        }

        return await response.json();
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

export const authAPI = {
    login: (email, password) => makeRequest('/auth/login', 'POST', { email, password }),
    checkAuth: (token) => makeRequest('/auth/auth', 'GET', null, token),
};

export const adminAPI = {
    getUsers: (token) => makeRequest('/user-group/users', 'GET', null, token),
    createUser: (userData, token) => makeRequest('/user-group/users', 'POST', userData, token),
    // Добавьте другие методы по аналогии
};

export const teacherAPI = {
    getTests: (token) => makeRequest('/test-question/tests', 'GET', null, token),
    createTest: (testData, token) => makeRequest('/test-question/tests', 'POST', testData, token),
    // Другие методы
};

export const studentAPI = {
    getMaterials: (token) => makeRequest('/topic-material/materials', 'GET', null, token),
    // Другие методы
};