import React, { useState } from "react";

const StudentDemo = () => {
  const [inputA, setInputA] = useState("1, 2, 3");
  const [inputB, setInputB] = useState("3, 4, 5");
  const [operation, setOperation] = useState("union");
  const [result, setResult] = useState([]);

  // Функция для преобразования строки в множество (массив чисел)
  const parseSet = (str) => {
    return [...new Set(
      str.split(',')
        .map(item => item.trim())
        .filter(item => item !== "")
        .map(Number)
        .filter(num => !isNaN(num))
    )];
  };

  const calculate = () => {
    const setA = parseSet(inputA);
    const setB = parseSet(inputB);
    
    const operations = {
      union: () => [...new Set([...setA, ...setB])],
      intersection: () => setA.filter(x => setB.includes(x)),
      difference: () => setA.filter(x => !setB.includes(x)),
      symmetricDifference: () => [
        ...setA.filter(x => !setB.includes(x)),
        ...setB.filter(x => !setA.includes(x))
      ]
    };

    setResult(operations[operation]());
  };

  return (
    <div style={{ 
    height: '70vh', 
    display: 'flex',
    width: '900px', 
    height: '480px', // Увеличил ширину для двух колонок
    margin: '20px auto', 
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
    {/* Левая колонка - ввод данных */}
    <div style={{ 
        flex: 1,
        paddingRight: '20px',
        borderRight: '1px solid #eee'
    }}>
        <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>Калькулятор множеств</h2>
        
        <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Множество A (элементы через запятую):
        </label>
        <input
            type="text"
            value={inputA}
            onChange={(e) => setInputA(e.target.value)}
            style={{
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '16px'
            }}
            placeholder="Например: 1, 2, 3, 4"
        />
        <div style={{ marginTop: '5px', color: '#7f8c8d', fontSize: '14px' }}>
            Текущее множество A: {`{${parseSet(inputA).join(', ')}}`}
        </div>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Множество B (элементы через запятую):
        </label>
        <input
            type="text"
            value={inputB}
            onChange={(e) => setInputB(e.target.value)}
            style={{
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '16px'
            }}
            placeholder="Например: 3, 4, 5, 6"
        />
        <div style={{ marginTop: '5px', color: '#7f8c8d', fontSize: '14px' }}>
            Текущее множество B: {`{${parseSet(inputB).join(', ')}}`}
        </div>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Выберите операцию:
        </label>
        <select
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            style={{
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '16px'
            }}
        >
            <option value="union">Объединение (A ∪ B)</option>
            <option value="intersection">Пересечение (A ∩ B)</option>
            <option value="difference">Разность (A \ B)</option>
            <option value="symmetricDifference">Кольцевая сумма (A ⊕ B)</option>
        </select>
        </div>
        
        <button
        onClick={calculate}
        style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'background-color 0.3s',
            ':hover': {
            backgroundColor: '#2980b9'
            }
        }}
        >
        Вычислить
        </button>
    </div>

    {/* Правая колонка - результат */}
    <div style={{ 
        flex: 1,
        paddingLeft: '20px',
        display: 'flex',
        flexDirection: 'column'
    }}>
        <h2 style={{ 
        textAlign: 'center', 
        color: '#2c3e50',
        marginBottom: '20px'
        }}>Результат</h2>
        
        {result.length > 0 ? (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        }}>
            <div style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            border: '1px solid #eee',
            textAlign: 'center'
            }}>
            <h3 style={{ marginTop: '0', color: '#2c3e50' }}>
                {operation === 'union' && 'Объединение A ∪ B'}
                {operation === 'intersection' && 'Пересечение A ∩ B'}
                {operation === 'difference' && 'Разность A \\ B'}
                {operation === 'symmetricDifference' && 'Кольцевая сумма A ⊕ B'}
            </h3>
            <div style={{ 
                backgroundColor: 'white', 
                padding: '15px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                margin: '10px 0',
                fontSize: '18px'
            }}>
                {`{${result.join(', ')}}`}
            </div>
            <p style={{ color: '#7f8c8d', fontSize: '14px', margin: '5px 0 0' }}>
                Количество элементов: {result.length}
            </p>
            </div>
        </div>
        ) : (
        <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7f8c8d',
            fontStyle: 'italic'
        }}>
            <p>Здесь будет отображен результат после вычисления</p>
        </div>
        )}
    </div>
    </div>
  );
};

export default StudentDemo;