import React, { useState, useMemo } from 'react';
import './styles/QuestionsList.css';

function QuestionsList({ selectedQuestions }) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuestions = useMemo(() => {
    if (selectedQuestions.length === 0) {
      return [];
    }

    let filtered = selectedQuestions;

    // Фільтрація за типом
    if (filter === 'questions') {
      filtered = filtered.filter(item => !item.question.includes('ОБМІН'));
    } else if (filter === 'exchanges') {
      filtered = filtered.filter(item => item.question.includes('ОБМІН'));
    }

    // Фільтрація за пошуковим терміном
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.student.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [selectedQuestions, filter, searchTerm]);

  if (selectedQuestions.length === 0) {
    return <div className="questions-list">Питання ще не обирались</div>;
  }

  return (
    <div className="questions-list">
      <h2>Історія обраних питань</h2>
      
      <div className="filter-controls">
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            Все ({selectedQuestions.length})
          </button>
          <button 
            className={filter === 'questions' ? 'active' : ''} 
            onClick={() => setFilter('questions')}
          >
            Питання ({selectedQuestions.filter(q => !q.question.includes('ОБМІН')).length})
          </button>
          <button 
            className={filter === 'exchanges' ? 'active' : ''} 
            onClick={() => setFilter('exchanges')}
          >
            Обміни ({selectedQuestions.filter(q => q.question.includes('ОБМІН')).length})
          </button>
        </div>
        
        <div className="search-box">
          <input
            type="text"
            placeholder="Пошук..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      <div className="table-container">
        <table className="questions-table">
          <thead>
            <tr>
              <th>Час</th>
              <th>Учень</th>
              <th>Питання</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map((item, index) => (
              <tr 
                key={index} 
                className={`
                  ${item.question.includes('ОБМІН') ? 'exchange-row' : ''} 
                  ${item.isRemoved ? 'removed-question' : ''}
                `}
              >
                <td>{item.timestamp}</td>
                <td>{item.student}</td>
                <td className={item.isRemoved ? 'strikethrough' : ''}>
                  {item.question}
                </td>
                <td>
                  {item.isRemoved ? (
                    <span className="status-badge removed">Обміняно</span>
                  ) : item.question.includes('ОБМІН') ? (
                    <span className="status-badge exchange">Обмін</span>
                  ) : (
                    <span className="status-badge active">Активне</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredQuestions.length === 0 && selectedQuestions.length > 0 && (
        <div className="no-results">
          <p>Нічого не знайдено за вказаними критеріями</p>
        </div>
      )}
    </div>
  );
}

export default QuestionsList;