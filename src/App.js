import React, { useState } from 'react';
import './App.css';
import QuestionBlock from './components/QuestionBlock';
import QuestionsList from './components/QuestionsList';
import StudentSelector from './components/StudentSelector';
import ExchangeQuestions from './components/ExchangeQuestions';
import ExportHistory from './components/ExportHistory';
import { questions } from './data/questions';

function App() {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [isStudentSelected, setIsStudentSelected] = useState(false);

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setIsStudentSelected(!!student);
    setSelectedQuestions([]); // Скидаємо історію питань при зміні учня
    setExchanges([]); // Скидаємо історію обмінів при зміні учня
  };

  const handleQuestionSelected = (question) => {
    const newQuestion = {
      student: selectedStudent,
      question: question,
      timestamp: new Date().toLocaleTimeString()
    };
    setSelectedQuestions([...selectedQuestions, newQuestion]);
  };

  const handleExchange = (exchangeType) => {
    // Запитуємо підтвердження
    const exchangeText = exchangeType === 'hardToNormal' 
      ? "1 Hard на 2 Normal" 
      : "1 Normal на 2 Easy";
      
    const confirmed = window.confirm(`Ви впевнені, що хочете активувати обмін: ${exchangeText}?`);
    
    if (confirmed) {
      const newExchange = {
        student: selectedStudent,
        exchangeType: exchangeType,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setExchanges([...exchanges, newExchange]);
      
      // Додаємо запис про обмін до історії у виділеному форматі
      const exchangeRecord = {
        student: selectedStudent,
        question: `--- ОБМІН АКТИВОВАНО: ${exchangeText} ---`,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setSelectedQuestions([...selectedQuestions, exchangeRecord]);
    }
  };

  const handleReset = () => {
    if (window.confirm('Ви впевнені, що хочете скинути всі обрані питання?')) {
      setSelectedQuestions([]);
      setExchanges([]);
      // Перезавантажуємо сторінку для скидання стану всіх компонентів
      window.location.reload();
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Підсумковий залік з геометрії</h1>
      </header>
      <main>
        <StudentSelector 
          selectedStudent={selectedStudent} 
          onStudentSelect={handleStudentSelect} 
        />
        
        {isStudentSelected && (
          <>
            <div className="selected-student-info">
              <h2>Обраний учень: {selectedStudent}</h2>
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
              selectedQuestions={selectedQuestions} 
              exchanges={exchanges} 
            />
            
            <button className="reset-button" onClick={handleReset}>
              Скинути всі питання
            </button>
            
            <QuestionsList selectedQuestions={selectedQuestions} />
          </>
        )}
        
        {!isStudentSelected && (
          <div className="no-student-message">
            <p>Будь ласка, оберіть учня зі списку вище, щоб продовжити.</p>
          </div>
        )}
      </main>
      <footer className="App-footer">
        <p>Рандомізатор питань для заліку з геометрії &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;