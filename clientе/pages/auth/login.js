document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Валидация
        if (!email || !password) {
            showError('Пожалуйста, заполните все поля');
            return;
        }
        
        try {
            // Показываем индикатор загрузки
            const submitBtn = loginForm.querySelector('button');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loader"></span> Вход...';
            
            // Отправляем запрос на сервер
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка входа');
            }
            
            const data = await response.json();
            
            // Сохраняем токен и пользователя
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Перенаправляем
            redirectByRole(data.user.role);
            
        } catch (error) {
            console.error('Ошибка входа:', error);
            showError(error.message || 'Ошибка сервера');
            
            // Восстанавливаем кнопку
            const submitBtn = loginForm.querySelector('button');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Вход';
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }

    function redirectByRole(role) {
        const pages = {
            admin: '/pages/admin/dashboard.html',
            teacher: '/pages/teacher/dashboard.html',
            student: '/pages/student/dashboard.html'
        };
        
        if (pages[role]) {
            window.location.href = pages[role];
        } else {
            showError('Неизвестная роль пользователя');
        }
    }
});