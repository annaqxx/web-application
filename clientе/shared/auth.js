export class AuthService {
    static getToken() {
        return localStorage.getItem('token');
    }

    static setToken(token) {
        localStorage.setItem('token', token);
    }

    static removeToken() {
        localStorage.removeItem('token');
    }

    static isAuthenticated() {
        return !!this.getToken();
    }

    static async login(email, password) {
        try {
            const response = await authAPI.login(email, password);
            this.setToken(response.token);
            return response;
        } catch (error) {
            throw error;
        }
    }

    static async checkAuth() {
        const token = this.getToken();
        if (!token) return null;
        
        try {
            const response = await authAPI.checkAuth(token);
            return response;
        } catch (error) {
            this.removeToken();
            throw error;
        }
    }

    static logout() {
        this.removeToken();
        // Перенаправление на страницу входа
        window.location.href = '/pages/auth/login.html';
    }
}