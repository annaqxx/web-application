import React, { useState, useEffect } from 'react';
import { getStudentResults } from '../../http/studentAPI';

const StudentResult = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const data = await getStudentResults();
                setResults(data);
            } catch (err) {
                setError('Не удалось загрузить результаты');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    };

    if (loading) return <div className="loading">Загрузка результатов...</div>;
    if (error) return <div className="error">{error}</div>;
    if (results.length === 0) return <div className="empty">У вас пока нет результатов тестирования</div>;

    return (
        <div className="student-results">
            <h2>Мои результаты тестирования</h2>
            
            <div className="results-table">
                <div className="table-header">
                    <div className="header-item">Название теста</div>
                    <div className="header-item">Преподаватель</div>
                    <div className="header-item">Результат</div>
                    <div className="header-item">Дата прохождения</div>
                </div>
                
                {results.map(result => (
                    <div key={result.id_result} className="table-row">
                        <div className="table-cell">
                            {result.Test?.title || 'Неизвестный тест'}
                        </div>
                        <div className="table-cell">
                            {result.Test?.creator 
                                ? `${result.Test.creator.first_name} ${result.Test.creator.last_name}`
                                : 'Неизвестный преподаватель'}
                        </div>
                        <div className="table-cell">
                            <span className={`result-badge ${result.passed ? 'passed' : 'failed'}`}>
                                {result.mark}% {result.passed ? '✓' : '✗'}
                            </span>
                        </div>
                        <div className="table-cell">
                            {formatDate(result.createdAt)}
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .student-results {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }
                
                h2 {
                    color: #333;
                    margin-bottom: 20px;
                }
                
                .loading, .error, .empty {
                    text-align: center;
                    padding: 40px;
                    font-size: 18px;
                }
                
                .error {
                    color: #d32f2f;
                }
                
                .empty {
                    color: #666;
                }
                
                .results-table {
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    overflow: hidden;
                }
                
                .table-header {
                    display: grid;
                    grid-template-columns: 2fr 2fr 1fr 1fr;
                    background-color: #f5f5f5;
                    font-weight: bold;
                    padding: 12px 15px;
                    border-bottom: 1px solid #ddd;
                }
                
                .table-row {
                    display: grid;
                    grid-template-columns: 2fr 2fr 1fr 1fr;
                    padding: 12px 15px;
                    border-bottom: 1px solid #eee;
                }
                
                .table-row:last-child {
                    border-bottom: none;
                }
                
                .table-row:hover {
                    background-color: #f9f9f9;
                }
                
                .table-cell {
                    padding: 5px 0;
                    display: flex;
                    align-items: center;
                }
                
                .result-badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-weight: 500;
                }
                
                .passed {
                    background-color: #e6f7e6;
                    color: #388e3c;
                }
                
                .failed {
                    background-color: #ffebee;
                    color: #d32f2f;
                }
            `}</style>
        </div>
    );
};

export default StudentResult;