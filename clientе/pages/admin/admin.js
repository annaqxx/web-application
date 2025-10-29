const toggleBtn = document.getElementById('theme-toggle'); // кнопка переключения темы
const themeIcon = document.getElementById('theme-icon'); // изображение внутри кнопки темы
const logo = document.getElementById('logo'); // логотип сайта
const body = document.body;
const logoutBtn = document.getElementById('logout-btn'); // кнопка выхода

// переключение темы
toggleBtn.addEventListener('click', () => {
    const isLight = body.classList.contains('light');
    body.classList.toggle('light');
    body.classList.toggle('dark');
    themeIcon.src = isLight 
        ? '../images/moon-icon.png' 
        : '../images/sun-icon.png';
    logo.src = isLight
        ? '../images/university-icon1.png' 
        : '../images/university-icon.png';    
});

// кнопка выход
document.getElementById('logout-btn').addEventListener('click', function() {
    window.location.href = '../auth/auth.html';
});

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация данных
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let groups = JSON.parse(localStorage.getItem('groups')) || [];
    let currentGroupId = groups.length > 0 ? Math.max(...groups.map(g => g.id)) + 1 : 1;
    let selectedStudents = [];
    
    // Элементы DOM
    const addUserBtn = document.getElementById('add-user-btn');
    const addUserModal = document.getElementById('add-user-modal');
    const closeBtn = document.querySelector('.close');
    const userForm = document.getElementById('user-form');
    const addGroupBtn = document.getElementById('add-group-btn');
    const assignTeacherBtn = document.getElementById('assign-teacher-btn');
    const groupModal = document.getElementById('group-modal');
    const closeGroupModal = document.querySelector('.close-group-modal');
    const groupForm = document.getElementById('group-form');
    const assignTeacherModal = document.getElementById('assign-teacher-modal');
    const closeAssignModal = document.querySelector('.close-assign-modal');
    const assignTeacherForm = document.getElementById('assign-teacher-form');

    const selectStudentsModal = document.getElementById('select-students-modal');
    const closeSelectStudents = document.querySelector('.close-select-students');
    const confirmStudentsBtn = document.getElementById('confirm-students');
    const studentSearch = document.getElementById('student-search');
    
    // Переключение между разделами
    const navButtons = document.querySelectorAll('.admin-nav-btn');
    const sections = document.querySelectorAll('.admin-section');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            navButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            this.classList.add('active');
            const sectionId = this.getAttribute('data-section') + '-section';
            document.getElementById(sectionId).classList.add('active');
        });
    });
    
    // Функция рендеринга пользователей
    function renderUsers() {
        const tbody = document.querySelector('#users-section tbody');
        tbody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <button class="edit-user" data-id="${user.id}">✏️</button>
                    <button class="delete-user" data-id="${user.id}">🗑️</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Обработчики удаления
        document.querySelectorAll('.delete-user').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = parseInt(this.getAttribute('data-id'));
                if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
                    users = users.filter(user => user.id !== userId);
                    localStorage.setItem('users', JSON.stringify(users));
                    renderUsers();
                    renderGroups();
                }
            });
        });
        
        // Обработчики редактирования
        document.querySelectorAll('.edit-user').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = parseInt(this.getAttribute('data-id'));
                openEditUserModal(userId);
            });
        });
    }
    
    // Функция рендеринга групп
    function renderGroups() {
        const tbody = document.querySelector('#groups-section tbody');
        tbody.innerHTML = '';
        
        groups.forEach(group => {
            const teacher = users.find(u => u.id === group.teacherId);
            const studentsCount = group.studentIds ? group.studentIds.length : 0;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${group.id}</td>
                <td>${group.name}</td>
                <td>${teacher ? teacher.name : 'Не назначен'}</td>
                <td>${studentsCount}</td>
                <td>
                    <button class="edit-group" data-id="${group.id}">✏️</button>
                    <button class="delete-group" data-id="${group.id}">🗑️</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Обработчики удаления групп
        document.querySelectorAll('.delete-group').forEach(btn => {
            btn.addEventListener('click', function() {
                const groupId = parseInt(this.getAttribute('data-id'));
                if (confirm('Вы уверены, что хотите удалить эту группу?')) {
                    groups = groups.filter(group => group.id !== groupId);
                    localStorage.setItem('groups', JSON.stringify(groups));
                    renderGroups();
                }
            });
        });
        
        // Обработчики редактирования групп
        document.querySelectorAll('.edit-group').forEach(btn => {
            btn.addEventListener('click', function() {
                const groupId = parseInt(this.getAttribute('data-id'));
                openEditGroupModal(groupId);
            });
        });
    }
    
    // Открытие модального окна добавления пользователя
    addUserBtn.addEventListener('click', function() {
        document.getElementById('modal-title').textContent = 'Добавить пользователя';
        userForm.reset();
        document.getElementById('user-id').value = '';
        addUserModal.style.display = 'block';
    });
    
    // Функция открытия модального окна редактирования пользователя
    function openEditUserModal(userId) {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        
        document.getElementById('modal-title').textContent = 'Редактировать пользователя';
        document.getElementById('user-id').value = user.id;
        document.getElementById('user-name').value = user.name;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-role').value = user.role;
        
        addUserModal.style.display = 'block';
    }

    // Обработка формы пользователя (должна обновлять группы)
    userForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userId = document.getElementById('user-id').value;
        const name = document.getElementById('user-name').value;
        const email = document.getElementById('user-email').value;
        const role = document.getElementById('user-role').value;
        
        if (userId) {
            // Редактирование существующего пользователя
            const index = users.findIndex(u => u.id === parseInt(userId));
            if (index !== -1) {
                const oldName = users[index].name; // Сохраняем старое имя
                
                // Обновляем данные пользователя
                users[index] = { 
                    id: parseInt(userId), 
                    name, 
                    email, 
                    role 
                };
                
                // Если имя изменилось, обновляем его в группах
                if (oldName !== name) {
                    updateUserNameInGroups(parseInt(userId), name);
                }
            }
        } else {
            // Добавление нового пользователя
            const newUser = {
                id: Date.now(),
                name,
                email,
                role
            };
            users.push(newUser);
        }
        
        localStorage.setItem('users', JSON.stringify(users));
        renderUsers();
        renderGroups(); // Перерисовываем группы, чтобы отобразить изменения
        addUserModal.style.display = 'none';
    });
    
    // Открытие модального окна добавления группы
    addGroupBtn.addEventListener('click', function() {
        document.getElementById('group-modal-title').textContent = 'Создать группу';
        groupForm.reset();
        document.getElementById('group-id').value = '';
        
        // Заполняем список преподавателей
        const teacherSelect = document.getElementById('group-teacher');
        teacherSelect.innerHTML = '<option value="">Выберите преподавателя</option>';
        
        users.filter(u => u.role === 'teacher').forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.id;
            option.textContent = teacher.name;
            teacherSelect.appendChild(option);
        });
        
        // Заполняем список студентов
        const studentsList = document.getElementById('students-list');
        studentsList.innerHTML = '';
        
        users.filter(u => u.role === 'student').forEach(student => {
            const div = document.createElement('div');
            div.className = 'student-checkbox';
            div.innerHTML = `
                <label>
                    <input type="checkbox" value="${student.id}">
                    ${student.name} (${student.email})
                </label>
            `;
            studentsList.appendChild(div);
        });
        
        groupModal.style.display = 'block';
    });
    
    // Открытие модального окна редактирования группы
    function openEditGroupModal(groupId) {
        const group = groups.find(g => g.id === groupId);
        if (!group) return;
        
        document.getElementById('group-modal-title').textContent = 'Редактировать группу';
        document.getElementById('group-id').value = group.id;
        document.getElementById('group-name').value = group.name;
        
        // Заполняем список преподавателей
        const teacherSelect = document.getElementById('group-teacher');
        teacherSelect.innerHTML = '<option value="">Выберите преподавателя</option>';
        
        users.filter(u => u.role === 'teacher').forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.id;
            option.textContent = teacher.name;
            option.selected = teacher.id === group.teacherId;
            teacherSelect.appendChild(option);
        });
        
        // Заполняем список студентов
        const studentsList = document.getElementById('students-list');
        studentsList.innerHTML = '';
        
        users.filter(u => u.role === 'student').forEach(student => {
            const div = document.createElement('div');
            div.className = 'student-checkbox';
            const isChecked = group.studentIds && group.studentIds.includes(student.id);
            div.innerHTML = `
                <label>
                    <input type="checkbox" value="${student.id}" ${isChecked ? 'checked' : ''}>
                    ${student.name} (${student.email})
                </label>
            `;
            studentsList.appendChild(div);
        });
        
        groupModal.style.display = 'block';
    }
    
    
    // Открытие модального окна назначения преподавателя
    assignTeacherBtn.addEventListener('click', function() {
        // Заполняем список групп
        const groupSelect = document.getElementById('select-group');
        groupSelect.innerHTML = '<option value="">Выберите группу</option>';
        
        groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.name;
            groupSelect.appendChild(option);
        });
        
        // Заполняем список преподавателей
        const teacherSelect = document.getElementById('select-teacher');
        teacherSelect.innerHTML = '<option value="">Выберите преподавателя</option>';
        
        users.filter(u => u.role === 'teacher').forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.id;
            option.textContent = teacher.name;
            teacherSelect.appendChild(option);
        });
        
        assignTeacherModal.style.display = 'block';
    });
    
    // Обработка формы назначения преподавателя
    assignTeacherForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const groupId = parseInt(document.getElementById('select-group').value);
        const teacherId = parseInt(document.getElementById('select-teacher').value);
        
        const groupIndex = groups.findIndex(g => g.id === groupId);
        if (groupIndex !== -1) {
            groups[groupIndex].teacherId = teacherId;
            localStorage.setItem('groups', JSON.stringify(groups));
            renderGroups();
            assignTeacherModal.style.display = 'none';
            assignTeacherForm.reset();
        }
    });
    
    // Закрытие модальных окон
    closeBtn.addEventListener('click', function() {
        addUserModal.style.display = 'none';
    });
    
    closeGroupModal.addEventListener('click', function() {
        groupModal.style.display = 'none';
    });
    
    closeAssignModal.addEventListener('click', function() {
        assignTeacherModal.style.display = 'none';
    });
    
    // Закрытие при клике вне окна
    window.addEventListener('click', function(event) {
        if (event.target === addUserModal) {
            addUserModal.style.display = 'none';
        }
        if (event.target === groupModal) {
            groupModal.style.display = 'none';
        }
        if (event.target === assignTeacherModal) {
            assignTeacherModal.style.display = 'none';
        }
    });
    
    // Инициализация
    renderUsers();
    renderGroups();

    // Обновленная функция открытия модального окна группы
    function openGroupModal(groupId = null) {
        const group = groupId ? groups.find(g => g.id === groupId) : null;
        
        document.getElementById('group-modal-title').textContent = groupId ? 'Редактировать группу' : 'Создать группу';
        document.getElementById('group-id').value = groupId || '';
        document.getElementById('group-name').value = group ? group.name : '';
        
        // Заполняем список преподавателей
        const teacherSelect = document.getElementById('group-teacher');
        teacherSelect.innerHTML = '<option value="">Выберите преподавателя</option>';
        
        users.filter(u => u.role === 'teacher').forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.id;
            option.textContent = teacher.name;
            if (group && teacher.id === group.teacherId) option.selected = true;
            teacherSelect.appendChild(option);
        });
        
        // Инициализируем выбранных студентов
        selectedStudents = group ? [...(group.studentIds || [])] : [];
        updateSelectedStudentsPreview();
        
        groupModal.style.display = 'block';
    }

    // Функция обновления превью выбранных студентов
    function updateSelectedStudentsPreview() {
        const previewContainer = document.getElementById('selected-students-preview');
        if (!previewContainer) return;
        
        previewContainer.innerHTML = selectedStudents.length ? 
            selectedStudents.map(id => {
                const student = users.find(u => u.id === id);
                return student ? `<span class="selected-student-tag">${student.name}</span>` : '';
            }).join('') :
            '<span style="color:#777;">Студенты не выбраны</span>';
    }

    // Функция обновления имени пользователя во всех группах
    function updateUserNameInGroups(userId, newName) {
        // Проходим по всем группам
        groups.forEach(group => {
            // Проверяем, является ли пользователь преподавателем группы
            if (group.teacherId === userId) {
                // Можно добавить здесь логику, если нужно что-то сделать с преподавателем
            }
            
            // Проверяем, есть ли пользователь среди студентов группы
            if (group.studentIds && group.studentIds.includes(userId)) {
            }
        });
        
        // Сохраняем изменения (хотя сами группы не изменились)
        localStorage.setItem('groups', JSON.stringify(groups));
    }

    // Обработчик кнопки выбора студентов
    document.getElementById('select-students-btn').addEventListener('click', openSelectStudentsModal);

    // Функция открытия модального окна выбора студентов
    function openSelectStudentsModal() {
        const studentsList = document.getElementById('select-students-list');
        studentsList.innerHTML = '';
        
        users.filter(u => u.role === 'student').forEach(student => {
            const item = document.createElement('div');
            item.className = 'select-student-item';
            item.innerHTML = `
                <input type="checkbox" value="${student.id}" 
                    ${selectedStudents.includes(student.id) ? 'checked' : ''}>
                <span>${student.name} (${student.email})</span>
            `;
            studentsList.appendChild(item);
        });
        
        selectStudentsModal.style.display = 'block';
    }

    // Поиск студентов
    studentSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const items = document.querySelectorAll('.select-student-item');
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchTerm) ? 'flex' : 'none';
        });
    });

    // Подтверждение выбора студентов
    confirmStudentsBtn.addEventListener('click', function() {
        selectedStudents = [];
        document.querySelectorAll('#select-students-list input:checked').forEach(checkbox => {
            selectedStudents.push(parseInt(checkbox.value));
        });
        
        updateSelectedStudentsPreview();
        selectStudentsModal.style.display = 'none';
    });

    // Обновленная обработка формы группы
    // Обработка формы группы (должен быть только один такой обработчик!)
    groupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const groupId = document.getElementById('group-id').value;
        const name = document.getElementById('group-name').value;
        const teacherId = parseInt(document.getElementById('group-teacher').value);
        
        if (!name || !teacherId) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }
        
        // Проверяем, редактируем ли существующую группу
        if (groupId) {
            const index = groups.findIndex(g => g.id === parseInt(groupId));
            if (index !== -1) {
                // Обновляем существующую группу
                groups[index] = { 
                    id: parseInt(groupId), 
                    name, 
                    teacherId, 
                    studentIds: selectedStudents 
                };
            }
        } else {
            // Создаем новую группу (только один раз!)
            const newGroup = {
                id: currentGroupId++,
                name,
                teacherId,
                studentIds: selectedStudents
            };
            groups.push(newGroup);
        }
        
        localStorage.setItem('groups', JSON.stringify(groups));
        renderGroups();
        groupModal.style.display = 'none';
    });

    // Обновленный рендер групп в таблице
    // Функция рендеринга групп
    function renderGroups() {
        const tbody = document.querySelector('#groups-section tbody');
        tbody.innerHTML = '';
        
        groups.forEach(group => {
            // Находим преподавателя по ID
            const teacher = users.find(u => u.id === group.teacherId);
            
            // Получаем список имен студентов
            const studentsList = group.studentIds 
                ? group.studentIds
                    .map(id => {
                        const student = users.find(u => u.id === id);
                        return student ? student.name : '';
                    })
                    .filter(name => name)
                    .join(', ')
                : 'Нет студентов';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${group.id}</td>
                <td>${group.name}</td>
                <td>${teacher ? teacher.name : 'Не назначен'}</td>
                <td>${studentsList}</td>
                <td>
                    <button class="edit-group" data-id="${group.id}">✏️</button>
                    <button class="delete-group" data-id="${group.id}">🗑️</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Добавляем обработчики для кнопок редактирования и удаления
        document.querySelectorAll('.edit-group').forEach(btn => {
            btn.addEventListener('click', function() {
                const groupId = parseInt(this.getAttribute('data-id'));
                openGroupModal(groupId);
            });
        });
        
        document.querySelectorAll('.delete-group').forEach(btn => {
            btn.addEventListener('click', function() {
                const groupId = parseInt(this.getAttribute('data-id'));
                if (confirm('Вы уверены, что хотите удалить эту группу?')) {
                    groups = groups.filter(group => group.id !== groupId);
                    localStorage.setItem('groups', JSON.stringify(groups));
                    renderGroups();
                }
            });
        });
    }

    // Закрытие модального окна выбора студентов
    closeSelectStudents.addEventListener('click', function() {
        selectStudentsModal.style.display = 'none';
    });

    // Закрытие при клике вне модального окна выбора студентов
    window.addEventListener('click', function(event) {
        if (event.target === selectStudentsModal) {
            selectStudentsModal.style.display = 'none';
        }
    });

    // Инициализация
    renderUsers();
    renderGroups();

    // Обновленные обработчики для кнопок групп
    addGroupBtn.addEventListener('click', function() {
        selectedStudents = [];
        openGroupModal();
    });

});