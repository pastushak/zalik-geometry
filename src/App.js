import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import QuestionBlock from './components/QuestionBlock';
import QuestionsList from './components/QuestionsList';
import StudentSelector from './components/StudentSelector';
import ExchangeQuestions from './components/ExchangeQuestions';
import ExportHistory from './components/ExportHistory';
import ThemeToggle from './components/ThemeToggle';
import Statistics from './components/Statistics';
import { questions } from './data/questions';
import { students } from './data/students';
import { useTheme } from './context/ThemeContext';
import { useNotification } from './context/NotificationContext';

function App() {
  // Використовуємо контекст теми і сповіщень
  const { isDarkMode } = useTheme();
  const { showNotification } = useNotification();
  
  // Спробуємо відновити стан з localStorage
  const [selectedStudent, setSelectedStudent] = useState(() => {
    const saved = localStorage.getItem('selectedStudent');
    return saved ? saved : '';
  });
  
  const [selectedQuestions, setSelectedQuestions] = useState(() => {
    const saved = localStorage.getItem('selectedQuestions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [exchanges, setExchanges] = useState(() => {
    const saved = localStorage.getItem('exchanges');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isStudentSelected, setIsStudentSelected] = useState(() => {
    return !!localStorage.getItem('selectedStudent');
  });
  
  // Стан для відображення статистики
  const [showStats, setShowStats] = useState(false);

  // Зберігаємо стан у localStorage при змінах
  useEffect(() => {
    localStorage.setItem('selectedStudent', selectedStudent);
    localStorage.setItem('selectedQuestions', JSON.stringify(selectedQuestions));
    localStorage.setItem('exchanges', JSON.stringify(exchanges));
  }, [selectedStudent, selectedQuestions, exchanges]);

  const handleStudentSelect = useCallback((student) => {
    setSelectedStudent(student);
    setIsStudentSelected(!!student);
    
    if (student) {
      showNotification(`Обрано учня: ${student}`, 'info');
      
      // Фільтруємо історію, щоб залишити тільки питання для цього учня
      const filteredQuestions = selectedQuestions.filter(q => q.student === student);
      if (filteredQuestions.length > 0) {
        setSelectedQuestions(prev => {
          const withoutCurrentStudent = prev.filter(q => q.student !== student);
          return [...withoutCurrentStudent, ...filteredQuestions];
        });
      }
      
      const filteredExchanges = exchanges.filter(e => e.student === student);
      if (filteredExchanges.length > 0) {
        setExchanges(prev => {
          const withoutCurrentStudent = prev.filter(e => e.student !== student);
          return [...withoutCurrentStudent, ...filteredExchanges];
        });
      }
    }
  }, [selectedQuestions, exchanges, showNotification]);

  const handleQuestionSelected = useCallback((question) => {
    const newQuestion = {
      student: selectedStudent,
      question: question,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setSelectedQuestions(prev => [...prev, newQuestion]);
    showNotification('Питання успішно обрано!', 'success');
    
    // Прокручуємо до історії питань після вибору на мобільних
    setTimeout(() => {
      const historyElement = document.querySelector('.questions-list');
      if (historyElement && window.innerWidth <= 768) {
        historyElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, [selectedStudent, showNotification]);

  const handleExchange = useCallback((exchangeType) => {
    // Запитуємо підтвердження
    const exchangeText = exchangeType === 'hardToNormal' 
      ? "1 Hard на 2 Normal" 
      : "1 Normal на 2 Easy";
      
    const confirmed = window.confirm(`Ви впевнені, що хочете активувати обмін: ${exchangeText}?`);
    
    if (confirmed) {
      const timestamp = new Date().toLocaleTimeString();
      
      const newExchange = {
        student: selectedStudent,
        exchangeType: exchangeType,
        timestamp
      };
      
      setExchanges(prev => [...prev, newExchange]);
      
      // Додаємо запис про обмін до історії у виділеному форматі
      const exchangeRecord = {
        student: selectedStudent,
        question: `--- ОБМІН АКТИВОВАНО: ${exchangeText} ---`,
        timestamp
      };
      
      setSelectedQuestions(prev => [...prev, exchangeRecord]);
      showNotification(`Обмін активовано: ${exchangeText}`, 'warning');
    }
  }, [selectedStudent, showNotification]);

  const handleReset = useCallback(() => {
    if (window.confirm('Ви впевнені, що хочете скинути всі обрані питання?')) {
      setSelectedQuestions([]);
      setExchanges([]);
      
      // Очищаємо localStorage
      localStorage.removeItem('selectedQuestions');
      localStorage.removeItem('exchanges');
      
      showNotification('Всі питання скинуто', 'info');
    }
  }, [showNotification]);

  const handleClearCurrentStudentHistory = useCallback(() => {
    if (window.confirm(`Ви впевнені, що хочете скинути всі питання для учня "${selectedStudent}"?`)) {
      const beforeCount = selectedQuestions.filter(q => q.student === selectedStudent).length;
      setSelectedQuestions(prev => prev.filter(q => q.student !== selectedStudent));
      setExchanges(prev => prev.filter(e => e.student !== selectedStudent));
      
      showNotification(`Очищено ${beforeCount} питань для ${selectedStudent}`, 'info');
    }
  }, [selectedStudent, selectedQuestions, showNotification]);

  // Функція для перемикання відображення статистики
  const toggleStats = useCallback(() => {
    setShowStats(prev => !prev);
  }, []);

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      <ThemeToggle />
      <header className="App-header">
        <h1>Рандомізатор питань на залік з геометрії</h1>
        <button onClick={toggleStats} className="stats-toggle-button">
          {showStats ? 'Сховати статистику' : 'Показати статистику'}
        </button>
      </header>
      <main>
        {showStats ? (
          <Statistics 
            selectedQuestions={selectedQuestions} 
            exchanges={exchanges}
            students={students}
          />
        ) : (
          <>
            <StudentSelector 
              selectedStudent={selectedStudent} 
              onStudentSelect={handleStudentSelect} 
            />
            
            {isStudentSelected && (
              <>
                <div className="selected-student-info">
                  <h2>Обраний учень: {selectedStudent}</h2>
                  <button onClick={handleClearCurrentStudentHistory} className="clear-student-button">
                    Очистити історію цього учня
                  </button>
                </div>
                
                <ExchangeQuestions 
                  onExchange={handleExchange} 
                  selectedStudent={selectedStudent} 
                />
                
                <div className="question-blocks">
                  <QuestionBlock 
                    title="Рівень Easy (1-48)" 
                    questions={questions.easy} 
                    onQuestionSelected={handleQuestionSelected} 
                  />
                  <QuestionBlock 
                    title="Рівень Normal (49-96)" 
                    questions={questions.normal} 
                    onQuestionSelected={handleQuestionSelected} 
                  />
                  <QuestionBlock 
                    title="Рівень Hard (97-120)" 
                    questions={questions.hard} 
                    onQuestionSelected={handleQuestionSelected} 
                  />
                </div>
                
                <ExportHistory 
                  selectedQuestions={selectedQuestions.filter(q => q.student === selectedStudent)} 
                  exchanges={exchanges.filter(e => e.student === selectedStudent)} 
                  onExportComplete={() => showNotification('Файл успішно збережено!', 'success')}
                />
                
                <div className="button-group">
                  <button className="reset-button" onClick={handleReset}>
                    Скинути всі питання
                  </button>
                </div>
                
                <QuestionsList 
                  selectedQuestions={selectedQuestions.filter(q => q.student === selectedStudent)} 
                />
              </>
            )}
            
            {!isStudentSelected && (
              <div className="no-student-message">
                <p>Будь ласка, оберіть учня зі списку вище, щоб продовжити.</p>
              </div>
            )}
          </>
        )}
      </main>
      <footer className="App-footer">
        <p>Рандомізатор питань для заліку з геометрії &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;