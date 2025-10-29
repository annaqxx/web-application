import React, {useState, useEffect, useRef} from 'react';
import { 
    fetchTrainingTests, 
    getTrainingTest, 
    submitTrainingTest 
} from "../../http/studentAPI";

const StudentTestTrain = () => {
    const [tests, setTests] = useState([]);
    const [current, setCurrent] = useState(null);
    const [answers, setAnswers] = useState({});
    const [results, setResults] = useState(null);
    const timerRef = useRef(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const testContainerRef = useRef(null);

    useEffect(() => {
        fetchTrainingTests().then(setTests).catch(console.error);
    }, []);

    const startTest = testId => {
        getTrainingTest(testId).then(t => {
            setCurrent(t);
            setAnswers({});
            setResults(null);
            if (t.time_limit) {
                setTimeLeft(t.time_limit * 60);
                timerRef.current = setInterval(() => {
                    setTimeLeft(prev => {
                        if(prev <= 1) {
                            clearInterval(timerRef.current);
                            onSubmit();
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
            // Добавляем небольшую задержку перед прокруткой
            setTimeout(() => {
                if (testContainerRef.current) {
                    // Добавляем параметры для плавной прокрутки с отступом
                    testContainerRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                        inline: 'nearest'
                    });
                    
                    // Дополнительная прокрутка вручную на случай, если scrollIntoView не сработал
                    window.scrollTo({
                        top: testContainerRef.current.offsetTop - 20,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        });
    };

    const onAnswer = (qId, value) => {
        setAnswers(prev => ({...prev, [qId]: value}));
    };

    const getAnswerText = (question, answerId) => {
        if (!question || !answerId) return answerId;
        if (question.type === 'options') {
            const option = question.options.find(o => o.id === answerId);
            return option ? option.text : answerId;
        }
        return answerId;
    };

    const onSubmit = () => {
        clearInterval(timerRef.current);
        submitTrainingTest(current.id_test, answers)
            .then(res => {
                const modifiedResults = {
                    ...res,
                    results: res.results.map(r => {
                        const question = current.questions.find(q => q.id_question === r.questionId);
                        return {
                            ...r,
                            userAnswer: Array.isArray(r.userAnswer) 
                                ? r.userAnswer.map(ans => {
                                    if (typeof ans === 'object') {
                                        return ans;
                                    }
                                    return getAnswerText(question, ans);
                                })
                                : getAnswerText(question, r.userAnswer),
                            correctAnswer: Array.isArray(r.correctAnswer) 
                                ? r.correctAnswer.map(ans => getAnswerText(question, ans))
                                : getAnswerText(question, r.correctAnswer)
                        };
                    })
                };
                setResults(modifiedResults);
                // Прокручиваем к результатам
                setTimeout(() => {
                    if (testContainerRef.current) {
                        testContainerRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            })
            .catch(console.error);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Стили в виде JavaScript объектов
    const styles = {
        container: {
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px',
            fontFamily: 'Arial, sans-serif'
        },
        header: {
            textAlign: 'center',
            marginBottom: '30px',
            color: '#333'
        },
        testList: {
            listStyle: 'none',
            padding: 0
        },
        testItem: {
            background: '#f9f9f9',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '15px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        testTitle: {
            marginTop: 0,
            color: '#2c3e50'
        },
        testButton: {
            background: '#3498db',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'background 0.3s'
        },
        testButtonHover: {
            background: '#2980b9'
        },
        testContainer: {
            background: 'white',
            borderRadius: '8px',
            padding: '25px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: '20px',
            minHeight: '100vh'
        },
        timer: {
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: '#f0f0f0',
            padding: '8px 12px',
            borderRadius: '20px',
            marginBottom: '15px',
            width: 'fit-content'
        },
        question: {
            marginBottom: '25px',
            paddingBottom: '15px',
            borderBottom: '1px solid #eee'
        },
        questionText: {
            fontWeight: 'bold',
            marginBottom: '10px',
            fontSize: '18px'
        },
        option: {
            display: 'block',
            margin: '8px 0',
            cursor: 'pointer'
        },
        radio: {
            marginRight: '8px'
        },
        matchingPair: {
            display: 'flex',
            alignItems: 'center',
            margin: '10px 0',
            gap: '10px'
        },
        textarea: {
            width: '100%',
            minHeight: '100px',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontFamily: 'inherit',
            fontSize: 'inherit'
        },
        submitButton: {
            background: '#27ae60',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '20px',
            transition: 'background 0.3s'
        },
        resultsContainer: {
            background: 'white',
            borderRadius: '8px',
            padding: '25px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        },
        resultItem: {
            marginBottom: '20px',
            paddingBottom: '20px',
            borderBottom: '1px solid #eee'
        },
        backButton: {
            background: '#7f8c8d',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '20px'
        },
        correctAnswer: {
            color: '#27ae60',
            fontWeight: 'bold'
        },
        incorrectAnswer: {
            color: '#e74c3c',
            fontWeight: 'bold'
        }
    };

    if (!current) {
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <h2>Тренировочные тесты</h2>
                </div>
                <ul style={styles.testList}>
                    {tests.map(t => (
                        <li key={t.id_test} style={styles.testItem}>
                            <h3 style={styles.testTitle}>{t.title}</h3>
                            <p>{t.description}</p>
                            <button 
                                style={styles.testButton}
                                onMouseOver={e => e.target.style.background = styles.testButtonHover.background}
                                onMouseOut={e => e.target.style.background = styles.testButton.background}
                                onClick={() => startTest(t.id_test)}
                            >
                                Начать тест
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    if (results) {
        return (
            <div style={styles.container} ref={testContainerRef}>
                <div  style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
                    <h2 style={styles.header}>Результаты теста</h2>
                    <p style={{ fontSize: '20px', marginBottom: '30px' }}>
                        Ваш балл: <strong>{results.score}%</strong> ({results.passed ? 
                            <span style={styles.correctAnswer}>Сдано</span> : 
                            <span style={styles.incorrectAnswer}>Не сдано</span>})
                    </p>
                    
                    <div>
                        {results.results.map(r => (
                            <div key={r.questionId} style={styles.resultItem}>
                                <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>{r.questionText}</p>
                                
                                <div style={{ marginBottom: '8px' }}>
                                    <span style={{ color: '#7f8c8d' }}>Ваш ответ: </span>
                                    {Array.isArray(r.userAnswer) 
                                        ? r.userAnswer.map((ans, i) => (
                                            typeof ans === 'object' 
                                                ? <div key={i} style={{ margin: '5px 0' }}>{ans.left} → {ans.right}</div>
                                                : <div key={i} style={{ margin: '5px 0' }}>{ans}</div>
                                        ))
                                        : <span>{r.userAnswer}</span>}
                                </div>
                                
                                <div style={{ marginBottom: '8px' }}>
                                    <span style={{ color: '#7f8c8d' }}>Правильный ответ: </span>
                                    {Array.isArray(r.correctAnswer) 
                                        ? r.correctAnswer.join(", ") 
                                        : r.correctAnswer}
                                </div>
                                
                                <div>
                                    {r.isCorrect 
                                        ? <span style={styles.correctAnswer}>✓ Верно ({r.score} баллов)</span>
                                        : <span style={styles.incorrectAnswer}>✗ Неверно</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        style={styles.backButton}
                        onClick={() => setCurrent(null)}
                    >
                        Вернуться к списку тестов
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container} ref={testContainerRef} >
            <div  style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ marginTop: 0 }}>{current.title}</h2>
                <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>{current.description}</p>
                
                {timeLeft !== null && (
                    <div style={styles.timer}>
                        <span>⏱️</span>
                        <span>Осталось времени: {formatTime(timeLeft)}</span>
                    </div>
                )}
                
                <form onSubmit={e => { e.preventDefault(); onSubmit(); }}>
                    {current.questions.map(q => (
                        <div key={q.id_question} style={styles.question}>
                            <p style={styles.questionText}>{q.text}</p>
                            
                            {q.type === 'options' && q.options && (
                                <div>
                                    {q.options.map(o => (
                                        <label key={o.id} style={styles.option}>
                                            <input
                                                type="radio"
                                                name={q.id_question}
                                                value={o.id}
                                                onChange={() => onAnswer(q.id_question, o.id)}
                                                style={styles.radio}
                                            />
                                            {o.text}
                                        </label>
                                    ))}
                                </div>
                            )}
                            
                            {q.type === 'matching' && q.pairs && (
                                <div>
                                    {q.pairs.map((p, i) => (
                                        <div key={i} style={styles.matchingPair}>
                                            <span>{p.left}</span>
                                            <span>→</span>
                                            <input
                                                type="text"
                                                onChange={e => {
                                                    const prev = answers[q.id_question] || [];
                                                    prev[i] = { left: p.left, right: e.target.value };
                                                    onAnswer(q.id_question, prev);
                                                }}
                                                style={{
                                                    padding: '8px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    flex: 1
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {q.type === 'open' && (
                                <textarea 
                                    style={styles.textarea}
                                    onChange={e => onAnswer(q.id_question, e.target.value)}
                                />
                            )}
                        </div>
                    ))}
                    
                    <button 
                        type="submit"
                        style={styles.submitButton}
                        onMouseOver={e => e.target.style.background = '#219653'}
                        onMouseOut={e => e.target.style.background = '#27ae60'}
                    >
                        Отправить ответы
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StudentTestTrain;