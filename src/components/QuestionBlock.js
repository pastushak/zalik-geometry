import React, { useState, useCallback, memo } from 'react';
import './styles/QuestionBlock.css';

const QuestionBlock = memo(function QuestionBlock({ title, questions, onQuestionSelected }) {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [animating, setAnimating] = useState(false);

  const handleSelectQuestion = useCallback(() => {
    // Фільтруємо питання, які ще не були обрані
    const availableQuestions = questions.filter(q => !selectedQuestions.includes(q));
    
    if (availableQuestions.length === 0) {
      alert("Всі питання цього рівня вже були обрані!");
      return;
    }
    
    // Обираємо випадкове питання
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const question = availableQuestions[randomIndex];
    
    // Анімація для мобільних
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      setSelectedQuestion(question);
      setSelectedQuestions(prevSelected => [...prevSelected, question]);
    
      // Передаємо обране питання наверх
      onQuestionSelected(question);
    }, 300);
  }, [questions, selectedQuestions, onQuestionSelected]);

  return (
    <div className={`question-block ${animating ? 'question-animating' : ''}`}>
      <h2>{title}</h2>
      <button onClick={handleSelectQuestion} disabled={animating}>
        {animating ? 'Обираємо...' : 'Обрати питання'}
      </button>
      {selectedQuestion && (
        <div className="selected-question">
          <h3>Обране питання:</h3>
          <p>{selectedQuestion}</p>
        </div>
      )}
    </div>
  );
});

export default QuestionBlock;