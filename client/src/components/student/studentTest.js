import React, { useState, useEffect } from "react";
import { 
    fetchStudentGroup, 
    fetchTestsByGroup, 
    getTestForStudent, 
    startTest, 
    submitTest 
} from "../../http/studentAPI";

const StudentTests = () => {
    const [group, setGroup] = useState(null);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTest, setCurrentTest] = useState(null);
    const [testData, setTestData] = useState(null);
    const [resultId, setResultId] = useState(null);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [testSubmitted, setTestSubmitted] = useState(false);
    const [testResult, setTestResult] = useState(null);

    const [completedTests, setCompletedTests] = useState(() => {
        const saved = localStorage.getItem('completedTests');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('completedTests', JSON.stringify(completedTests));
    }, [completedTests]);

    useEffect(() => {
        // В методе loadTests компонента StudentTests
        const loadTests = async () => {
            try {
                setLoading(true);
                const groupData = await fetchStudentGroup();
                setGroup(groupData);
                
                // Загружаем только обычные тесты (не тренировочные)
                const testsData = await fetchTestsByGroup(groupData.id_group);
                
                // Дополнительная фильтрация на клиенте (на всякий случай)
                const filteredTests = testsData.filter(test => !test.is_training);
                
                setTests(filteredTests);
                setLoading(false);
            } catch (e) {
                setError('Ошибка при загрузке тестов');
                console.error(e);
                setLoading(false);
                setTests([]);
            }
        };

        loadTests();
    }, []);

    useEffect(() => {
        let interval = null;
        
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && timerActive) {
            handleSubmitTest();
        }
        
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    const handleStartTest = async (testId) => {
        try {
            setLoading(true);
            setError(null);
            
            const testResponse = await getTestForStudent(testId);
            const startResponse = await startTest(testId);
            
            setCurrentTest(testId);
            setTestData(testResponse);
            setResultId(startResponse.resultId);
            setAnswers({});
            
            if (testResponse.time_limit) {
                setTimeLeft(testResponse.time_limit * 60);
                setTimerActive(true);
            }
            
            setLoading(false);
        } catch (error) {
            console.error("Ошибка при начале теста:", error);
            setError(error.response?.data?.message || error.message);
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleSubmitTest = async () => {
        try {
            setTimerActive(false);
            setLoading(true);
            
            if (!testData || !testData.questions || !resultId) {
                throw new Error('Недостаточно данных для отправки теста');
            }
            
            const formattedAnswers = testData.questions.map(question => ({
                questionId: question.id_question,
                answer: answers[question.id_question] || null
            }));
            
            const timeTaken = testData.time_limit 
                ? Math.max(0, testData.time_limit * 60 - timeLeft)
                : 0;
            
            const result = await submitTest(resultId, formattedAnswers, timeTaken);

            // Обновляем completedTests независимо от результата
            setCompletedTests(prev => [...prev, currentTest]);
            
            setTestResult({
                ...result,
                timeTaken: timeTaken
            });
            setTestSubmitted(true);
            setLoading(false);
            
            const testsData = await fetchTestsByGroup(group.id_group);
            setTests(testsData || []);
        } catch (e) {
            console.error(e);
            setError('Ошибка при отправке теста');
            setLoading(false);
        }
    };

    const handleBackToTests = () => {
        setCurrentTest(null);
        setTestData(null);
        setResultId(null);
        setAnswers({});
        setTimeLeft(0);
        setTimerActive(false);
        setTestSubmitted(false);
        setTestResult(null);
    };

    const formatTime = (seconds) => {
        // Проверяем, что seconds является числом
        const sec = Number(seconds) || 0;
        const mins = Math.floor(sec / 60);
        const secs = sec % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return (
        <div style={{
            padding: '20px',
            backgroundColor: '#ffebee',
            borderRadius: '8px',
            margin: '20px',
            textAlign: 'center'
        }}>
            <p style={{ color: '#d32f2f', marginBottom: '15px' }}>{error}</p>
            
            <button 
                onClick={() => setError(null)}
                style={{
                    marginTop: '10px',
                    padding: '8px 16px',
                    backgroundColor: '#f5f5f5',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Закрыть
            </button>
        </div>
    );

    if (currentTest && testData && testData.questions) {
        return (
            <div className="test-container" style={{ 
                maxWidth: '800px', 
                margin: '0 auto', 
                padding: '20px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '20px',
                    borderBottom: '1px solid #eee',
                    paddingBottom: '15px'
                }}>
                    <h2 style={{ margin: 0 }}>{testData.title}</h2>
                    {testData.time_limit && (
                        <div style={{ 
                            backgroundColor: '#f0f0f0',
                            padding: '8px 12px',
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            color: timeLeft < 300 ? '#d32f2f' : '#388e3c'
                        }}>
                            {formatTime(timeLeft)}
                        </div>
                    )}
                </div>
                
                {testData.description && (
                    <p style={{ color: '#555', marginBottom: '25px' }}>
                        {testData.description}
                    </p>
                )}
                
                {testSubmitted && testResult ? (
                    <div style={{ 
                        backgroundColor: '#f8f9fa', 
                        padding: '20px', 
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{ marginTop: 0, color: testResult.passed ? '#388e3c' : '#d32f2f' }}>
                            {testResult.passed ? 'Тест пройден!' : 'Тест не пройден'}
                        </h3>
                        <p>Ваш результат: <strong>{testResult.score}%</strong></p>
                        <p>Проходной балл: <strong>{testResult.passingScore}%</strong></p>
                        <p>Затраченное время: <strong>
                            {testResult.timeTaken !== undefined ? formatTime(testResult.timeTaken) : '--:--'}
                        </strong></p>

                        {!testResult.passed && (
                            <div style={{ 
                                marginTop: '15px',
                                padding: '15px',
                                backgroundColor: '#fff3e0',
                                borderRadius: '4px',
                                borderLeft: '4px solid #ffa000'
                            }}>
                                <p style={{ margin: '0 0 10px 0', fontWeight: '500' }}>
                                    Рекомендация:
                                </p>
                                <p style={{ margin: 0 }}>
                                    Пройдите тренировочный тест на странице "Тренировочные тесты" для подготовки
                                </p>
                            </div>
                        )}
                        
                        <button 
                            onClick={handleBackToTests}
                            style={{
                                marginTop: '15px',
                                padding: '10px 20px',
                                backgroundColor: '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Вернуться к списку тестов
                        </button>
                    </div>
                ) : (
                    <div>
                        {testData.questions.map((question, index) => (
                            <div 
                                key={question.id_question} 
                                style={{ 
                                    marginBottom: '30px',
                                    padding: '15px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '6px'
                                }}
                            >
                                <h4 style={{ marginTop: 0 }}>
                                    Вопрос {index + 1}: {question.text}
                                </h4>
                                
                                {question.type === 'options' && (
                                    <div style={{ marginLeft: '15px' }}>
                                        {question.options.map(option => (
                                            <div key={option.id} style={{ marginBottom: '8px' }}>
                                                <label style={{ display: 'flex', alignItems: 'center' }}>
                                                    <input
                                                        type={question.options.length > 1 ? "checkbox" : "radio"}
                                                        name={`question-${question.id_question}`}
                                                        value={option.id}
                                                        onChange={(e) => {
                                                            if (question.options.length > 1) {
                                                                const current = answers[question.id_question] || [];
                                                                const newAnswers = e.target.checked
                                                                    ? [...current, option.id]
                                                                    : current.filter(id => id !== option.id);
                                                                handleAnswerChange(question.id_question, newAnswers);
                                                            } else {
                                                                handleAnswerChange(question.id_question, option.id);
                                                            }
                                                        }}
                                                        style={{ marginRight: '10px' }}
                                                    />
                                                    {option.text}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {question.type === 'open' && (
                                    <textarea
                                        value={answers[question.id_question] || ''}
                                        onChange={(e) => handleAnswerChange(question.id_question, e.target.value)}
                                        style={{
                                            width: '100%',
                                            minHeight: '100px',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px'
                                        }}
                                        placeholder="Введите ваш ответ..."
                                    />
                                )}
                                
                                {question.type === 'matching' && (
                                    <div style={{ marginLeft: '15px' }}>
                                        <p style={{ fontStyle: 'italic', color: '#666' }}>
                                            Сопоставьте элементы:
                                        </p>
                                        
                                        <div style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '10px',
                                            marginBottom: '15px'
                                        }}>
                                            {question.pairs.map((pair, idx) => (
                                                <React.Fragment key={idx}>
                                                    <div style={{ 
                                                        padding: '8px',
                                                        backgroundColor: '#e9ecef',
                                                        borderRadius: '4px'
                                                    }}>
                                                        {pair.left}
                                                    </div>
                                                    <select
                                                        value={answers[question.id_question]?.[idx]?.right || ''}
                                                        onChange={(e) => {
                                                            const currentPairs = answers[question.id_question] || [];
                                                            const newPairs = [...currentPairs];
                                                            newPairs[idx] = {
                                                                left: pair.left,
                                                                right: e.target.value
                                                            };
                                                            handleAnswerChange(question.id_question, newPairs);
                                                        }}
                                                        style={{
                                                            padding: '8px',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '4px'
                                                        }}
                                                    >
                                                        <option value="">Выберите соответствие</option>
                                                        {question.pairs.map((p, i) => (
                                                            <option key={i} value={p.right}>
                                                                {p.right}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center',
                            marginTop: '30px'
                        }}>
                            <button
                                onClick={handleSubmitTest}
                                style={{
                                    padding: '12px 25px',
                                    backgroundColor: '#4caf50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Отправить тест
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="student-tests-container" style={{ 
            height: '70vh', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            padding: '20px'
        }}>
            <h2 style={{ marginBottom: '25px' }}>Мои тесты</h2>
            
            {tests.length === 0 ? (
                <p>На данный момент нет доступных тестов</p>
            ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    overflowX: 'auto',
                    gap: '20px',
                    padding: '10px 0',
                    width: '100%'
                }}>
                    {tests.map(test => (
                        <div key={test.id_test} style={{
                            flex: '0 0 auto',
                            width: '300px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '10px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            padding: '20px',
                            margin: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: '#fff'
                        }}>
                            <div style={{
                                borderBottom: '1px solid #eee',
                                paddingBottom: '15px',
                                marginBottom: '15px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <h3 style={{ 
                                    margin: 0,
                                    color: '#333',
                                    fontSize: '18px',
                                    fontWeight: '600'
                                }}>{test.title}</h3>
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    backgroundColor: new Date(test.deadline) > new Date() ? '#e6f7ee' : '#ffebee',
                                    color: new Date(test.deadline) > new Date() ? '#1a936f' : '#c62828'
                                }}>
                                    {new Date(test.deadline) > new Date() ? 'Активен' : 'Завершён'}
                                </span>
                            </div>
                            
                            <div style={{
                                flexGrow: 1,
                                marginBottom: '15px'
                            }}>
                                <p style={{
                                    margin: 0,
                                    color: '#555',
                                    fontSize: '14px',
                                    lineHeight: '1.5'
                                }}>{test.description}</p>
                            </div>
                            
                            <div style={{
                                backgroundColor: '#f9f9f9',
                                borderRadius: '8px',
                                padding: '12px',
                                marginBottom: '20px'
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    marginBottom: '8px'
                                }}>
                                    <span style={{ color: '#777', fontSize: '13px' }}>Дедлайн:</span>
                                    <span style={{ color: '#333', fontWeight: '500' }}>
                                        {new Date(test.deadline).toLocaleString()}
                                    </span>
                                </div>
                                
                                {test.time_limit && (
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        marginBottom: '8px'
                                    }}>
                                        <span style={{ color: '#777', fontSize: '13px' }}>Лимит времени:</span>
                                        <span style={{ color: '#333', fontWeight: '500' }}>
                                            {test.time_limit} минут
                                        </span>
                                    </div>
                                )}
                                
                                {test.passing_score && (
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between'
                                    }}>
                                        <span style={{ color: '#777', fontSize: '13px' }}>Проходной балл:</span>
                                        <span style={{ color: '#333', fontWeight: '500' }}>
                                            {test.passing_score}%
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            <button 
                                onClick={() => handleStartTest(test.id_test)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: completedTests.includes(test.id_test) || new Date(test.deadline) < new Date() 
                                        ? '#e0e0e0' 
                                        : '#4caf50',
                                    color: completedTests.includes(test.id_test) || new Date(test.deadline) < new Date() 
                                        ? '#9e9e9e' 
                                        : 'white',
                                    fontWeight: '600',
                                    cursor: completedTests.includes(test.id_test) || new Date(test.deadline) < new Date() 
                                        ? 'not-allowed' 
                                        : 'pointer'
                                }}
                                disabled={completedTests.includes(test.id_test) || new Date(test.deadline) < new Date()}
                            >
                                {completedTests.includes(test.id_test) 
                                    ? 'Тест завершен' 
                                    : new Date(test.deadline) < new Date() 
                                        ? 'Срок сдачи истёк' 
                                        : 'Начать тест'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentTests; 