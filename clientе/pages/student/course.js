const toggleBtn = document.getElementById('theme-toggle'); // кнопка переключения темы
const themeIcon = document.getElementById('theme-icon'); // изображение внутри кнопки темы
const logo = document.getElementById('logo'); // логотип сайта
const body = document.body;
const logoutBtn = document.getElementById('logout-btn'); // кнопка выхода
const backBtn = document.getElementById('back-btn'); // кнопка "Назад"

// Проверяем сохранённую тему при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.remove('light');
        body.classList.add('dark');
        themeIcon.src = '../images/moon-icon.png';
        logo.src = '../images/university-icon1.png';
    }
});

// Обработчик переключения темы
toggleBtn.addEventListener('click', () => {
    const isLight = body.classList.contains('light');
    
    // Переключаем тему
    body.classList.toggle('light');
    body.classList.toggle('dark');
    
    // Обновляем иконку и логотип
    themeIcon.src = isLight ? '../images/moon-icon.png' : '../images/sun-icon.png';
    logo.src = isLight ? '../images/university-icon1.png' : '../images/university-icon.png';
    
    // Сохраняем тему в localStorage
    localStorage.setItem('theme', isLight ? 'dark' : 'light');
});

// кнопка выход
document.getElementById('logout-btn').addEventListener('click', function() {
    window.location.href = '../auth/auth.html';
});

// кнопка назад
backBtn.addEventListener('click', () => {
    backBtn.classList.add('clicked');
    setTimeout(() => {
        window.location.href = 'courses.html';
    }, 300);
});

document.addEventListener('DOMContentLoaded', function() {
    // Получаем все элементы
    const theoryBtn = document.querySelector('[data-section="theory"]');
    const testsBtn = document.querySelector('[data-section="tests"]');
    const theorySection = document.getElementById('theory-section');
    const testsSection = document.getElementById('tests-section');
    
    // Обработчики кликов на кнопки
    theoryBtn.addEventListener('click', function() {
        theoryBtn.classList.add('active');
        testsBtn.classList.remove('active');
        theorySection.classList.add('active');
        testsSection.classList.remove('active');
    });
    
    testsBtn.addEventListener('click', function() {
        testsBtn.classList.add('active');
        theoryBtn.classList.remove('active');
        testsSection.classList.add('active');
        theorySection.classList.remove('active');
    });
    
});

