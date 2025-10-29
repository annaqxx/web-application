import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './auth.css';
import universityIcon from "../../assets/university-icon.png";
import { login } from "../../http/userAPI";
import { Context } from '../../index';
import { observer } from 'mobx-react-lite';

const LoginPage = observer(() => {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userData = await login(email, password);
      user.setUser(userData);
      user.setIsAuth(true);
      // Перенаправление по роли
      switch(userData.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'teacher':
          navigate('/teacher');
          break;
        case 'student':
          navigate('/student');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      console.error('Ошибка входа:', err);
      setError(err.response?.data?.message || 'Неверные учетные данные');
    }
  };

  return (
    <div className="login">
      <img src={universityIcon} alt="Логотип университета" className="logo" />
      <h2>Личный кабинет</h2>
      <hr size="1" width="300" />
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Электронная почта</label>
          <input
            type="email"
            id="email"
            placeholder="Введите ваш email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            placeholder="Введите пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength="6"
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit">Вход</button>
      </form>
    </div>
  );
});

export default LoginPage;