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
  const { isDarkMode } = useTheme();
  const { showNotification } = useNotification();
  
  // Основний стан
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
  
  // Новий стан для відстеження додаткових слотів
  const [additionalSlots, setAdditionalSlots] = useState(() => {
    const saved = localStorage.getItem('additionalSlots');
    return saved ? JSON.parse(saved) : { easy: 0, normal: 0, hard: 0 };
  });
  
  // Стан для видалених питань (через обмін)
  const [removedQuestions, setRemovedQuestions] = useState(() => {
    const saved = localStorage.getItem('removedQuestions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isStudentSelected, setIsStudentSelected] = useState(() => {
    return !!localStorage.getItem('selectedStudent');
  });
  
  const [showStats, setShowStats] = useState(false);

  const [resetTrigger, setResetTrigger] = useState(0);

  const [studentChangeTrigger, setStudentChangeTrigger] = useState(0);

  // Зберігаємо стан у localStorage при змінах
  useEffect(() => {
    localStorage.setItem('selectedStudent', selectedStudent);
    localStorage.setItem('selectedQuestions', JSON.stringify(selectedQuestions));
    localStorage.setItem('exchanges', JSON.stringify(exchanges));
    localStorage.setItem('additionalSlots', JSON.stringify(additionalSlots));
    localStorage.setItem('removedQuestions', JSON.stringify(removedQuestions));
  }, [selectedStudent, selectedQuestions, exchanges, additionalSlots, removedQuestions]);


  // Отримуємо всі обрані питання для поточного учня
  const currentStudentQuestions = selectedQuestions.filter(q => q.student === selectedStudent);
  
  // Отримуємо заблоковані питання по рівнях
  const getBlockedQuestions = useCallback((level) => {
    return currentStudentQuestions
      .filter(q => !q.question.includes('ОБМІН'))
      .map(q => q.question)
      .filter(q => {
        if (level === 'easy') return questions.easy.includes(q);
        if (level === 'normal') return questions.normal.includes(q);
        if (level === 'hard') return questions.hard.includes(q);
        return false;
      });
  }, [currentStudentQuestions, questions]);

  const handleStudentSelect = useCallback((student) => {
    setSelectedStudent(student);
    setIsStudentSelected(!!student);
    
    if (student) {
      showNotification(`Обрано учня: ${student}`, 'info');
      
      // Очищуємо локальні стани
      setAdditionalSlots({ easy: 0, normal: 0, hard: 0 });
      setRemovedQuestions([]);
      
      // Фільтруємо дані для поточного учня
      const studentExchanges = exchanges.filter(e => e.student === student);
      const studentQuestions = selectedQuestions.filter(q => q.student === student);
      
      // Відновлюємо стан додаткових слотів для поточного учня
      const newAdditionalSlots = { easy: 0, normal: 0, hard: 0 };
      const newRemovedQuestions = [];
      
      studentExchanges.forEach(exchange => {
        if (exchange.exchangeType === 'hardToNormal') {
          newAdditionalSlots.normal += 2;
        } else if (exchange.exchangeType === 'normalToEasy') {
          newAdditionalSlots.easy += 2;
        }
        
        if (exchange.removedQuestion) {
          newRemovedQuestions.push(exchange.removedQuestion);
        }
      });
      
      // Також додаємо видалені питання з selectedQuestions
      studentQuestions.forEach(q => {
        if (q.isRemoved) {
          newRemovedQuestions.push(q.question);
        }
      });
      
      setAdditionalSlots(newAdditionalSlots);
      setRemovedQuestions(newRemovedQuestions);
      
      // Тригер для очищення карточок при зміні учня
      setStudentChangeTrigger(prev => prev + 1);
    } else {
      // Якщо учня не обрано, очищуємо все
      setAdditionalSlots({ easy: 0, normal: 0, hard: 0 });
      setRemovedQuestions([]);
      setStudentChangeTrigger(prev => prev + 1);
    }
  }, [selectedQuestions, exchanges, showNotification]);

  const handleQuestionSelected = useCallback((question, level) => {
    const newQuestion = {
      student: selectedStudent,
      question: question,
      timestamp: new Date().toLocaleTimeString(),
      level: level,
      isRemoved: false
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
    const exchangeText = exchangeType === 'hardToNormal' 
      ? "1 Hard на 2 Normal" 
      : "1 Normal на 2 Easy";
      
    const confirmed = window.confirm(`Ви впевнені, що хочете активувати обмін: ${exchangeText}?`);
    
    if (confirmed) {
      const timestamp = new Date().toLocaleTimeString();
      
      // Визначаємо, з якого рівня беремо питання і яким рівнем отримуємо
      let fromLevel, toLevel, removeCount, addCount;
      
      if (exchangeType === 'hardToNormal') {
        fromLevel = 'hard';
        toLevel = 'normal';
        removeCount = 1;
        addCount = 2;
      } else {
        fromLevel = 'normal';
        toLevel = 'easy';
        removeCount = 1;
        addCount = 2;
      }
      
      // Знаходимо останнє обране питання з відповідного рівня
      const questionsFromLevel = currentStudentQuestions
        .filter(q => q.level === fromLevel && !q.question.includes('ОБМІН') && !q.isRemoved)
        .reverse(); // Беремо останнє
      
      if (questionsFromLevel.length === 0) {
        showNotification(`Немає доступних питань рівня ${fromLevel.toUpperCase()} для обміну!`, 'error');
        return;
      }
      
      const questionToRemove = questionsFromLevel[0];
      
      // Додаємо питання до списку видалених
      setRemovedQuestions(prev => [...prev, questionToRemove.question]);
      
      // Позначаємо питання як видалене
      setSelectedQuestions(prev => 
        prev.map(q => 
          q.question === questionToRemove.question && q.student === selectedStudent 
            ? { ...q, isRemoved: true }
            : q
        )
      );
      
      // Додаємо додаткові слоти
      setAdditionalSlots(prev => ({
        ...prev,
        [toLevel]: prev[toLevel] + addCount
      }));
      
      // Зберігаємо обмін
      const newExchange = {
        student: selectedStudent,
        exchangeType: exchangeType,
        timestamp,
        fromLevel,
        toLevel,
        removedQuestion: questionToRemove.question
      };
      
      setExchanges(prev => [...prev, newExchange]);
      
      // Додаємо запис про обмін до історії
      const exchangeRecord = {
        student: selectedStudent,
        question: `--- ОБМІН АКТИВОВАНО: ${exchangeText} ---`,
        timestamp,
        isExchange: true,
        isRemoved: false
      };
      
      setSelectedQuestions(prev => [...prev, exchangeRecord]);
      
      showNotification(
        `Обмін активовано! Додано ${addCount} слотів для рівня ${toLevel.toUpperCase()}`, 
        'warning',
        4000
      );
    }
  }, [selectedStudent, currentStudentQuestions, showNotification]);

  const handleReset = useCallback(() => {
  if (window.confirm('Ви впевнені, що хочете скинути всі обрані питання?')) {
    setSelectedQuestions([]);
    setExchanges([]);
    setAdditionalSlots({ easy: 0, normal: 0, hard: 0 });
    setRemovedQuestions([]);
    
    // Очищаємо localStorage
    localStorage.removeItem('selectedQuestions');
    localStorage.removeItem('exchanges');
    localStorage.removeItem('additionalSlots');
    localStorage.removeItem('removedQuestions');
    
    // Встановлюємо тригер для скидання QuestionBlock
    setResetTrigger(prev => prev + 1);
    
    showNotification('Всі питання скинуто', 'info');
  }
}, [showNotification]);

  const handleClearCurrentStudentHistory = useCallback(() => {
  if (window.confirm(`Ви впевнені, що хочете скинути всі питання для учня "${selectedStudent}"?`)) {
    const beforeCount = selectedQuestions.filter(q => q.student === selectedStudent).length;
    
    setSelectedQuestions(prev => prev.filter(q => q.student !== selectedStudent));
    setExchanges(prev => prev.filter(e => e.student !== selectedStudent));
    setAdditionalSlots({ easy: 0, normal: 0, hard: 0 });
    setRemovedQuestions([]);
    
    // Встановлюємо тригер для скидання QuestionBlock
    setResetTrigger(prev => prev + 1);
    
    showNotification(`Очищено ${beforeCount} питань для ${selectedStudent}`, 'info');
  }
  }, [selectedStudent, selectedQuestions, showNotification]);

  const toggleStats = useCallback(() => {
    setShowStats(prev => !prev);
  }, []);

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      <ThemeToggle />
      <header className="App-header">
        <h1>Твої випадкові питання на заліку з геометрії</h1>
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
                  selectedQuestions={selectedQuestions}
                  exchanges={exchanges.filter(e => e.student === selectedStudent)}
                />
                
                <div className="question-blocks">
                  <QuestionBlock 
                    title="Рівень Easy (1-48)" 
                    questions={questions.easy} 
                    onQuestionSelected={handleQuestionSelected}
                    level="easy"
                    blockedQuestions={getBlockedQuestions('easy')}
                    additionalSlots={additionalSlots.easy}
                    removedQuestions={removedQuestions}
                    exchanges={exchanges.filter(e => e.student === selectedStudent)}
                    resetTrigger={resetTrigger}
                    studentChangeTrigger={studentChangeTrigger}
                  />
                  <QuestionBlock 
                    title="Рівень Normal (49-96)" 
                    questions={questions.normal} 
                    onQuestionSelected={handleQuestionSelected}
                    level="normal"
                    blockedQuestions={getBlockedQuestions('normal')}
                    additionalSlots={additionalSlots.normal}
                    removedQuestions={removedQuestions}
                    exchanges={exchanges.filter(e => e.student === selectedStudent)}
                    resetTrigger={resetTrigger}
                    studentChangeTrigger={studentChangeTrigger}
                  />
                  <QuestionBlock 
                    title="Рівень Hard (97-120)" 
                    questions={questions.hard} 
                    onQuestionSelected={handleQuestionSelected}
                    level="hard"
                    blockedQuestions={getBlockedQuestions('hard')}
                    additionalSlots={additionalSlots.hard}
                    removedQuestions={removedQuestions}
                    exchanges={exchanges.filter(e => e.student === selectedStudent)}
                    resetTrigger={resetTrigger}
                    studentChangeTrigger={studentChangeTrigger}
                  />
                </div>
                
                <ExportHistory 
                  selectedQuestions={currentStudentQuestions} 
                  exchanges={exchanges.filter(e => e.student === selectedStudent)} 
                  onExportComplete={() => showNotification('Файл успішно збережено!', 'success')}
                />
                
                <div className="button-group">
                  <button className="reset-button" onClick={handleReset}>
                    Скинути всі питання
                  </button>
                </div>
                
                <QuestionsList 
                  selectedQuestions={currentStudentQuestions} 
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