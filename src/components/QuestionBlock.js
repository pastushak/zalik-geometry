import React, { useState } from 'react';
import './QuestionBlock.css';

function QuestionBlock({ title, questions, onQuestionSelected }) {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const handleSelectQuestion = () => {
    // Фільтруємо питання, які ще не були обрані
    const availableQuestions = questions.filter(q => !selectedQuestions.includes(q));
    
    if (availableQuestions.length === 0) {
      alert("Всі питання цього рівня вже були обрані!");
      return;
    }
    
    // Обираємо випадкове питання
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const question = availableQuestions[randomIndex];
    
    setSelectedQuestion(question);
    setSelectedQuestions([...selectedQuestions, question]);
    
    // Передаємо обране питання наверх
    onQuestionSelected(question);
  };

  return (
    <div className="question-block">
      <h2>{title}</h2>
      <button onClick={handleSelectQuestion}>Обрати</button>
      {selectedQuestion && (
        <div className="selected-question">
          <h3>Обране питання:</h3>
          <p>{selectedQuestion}</p>
        </div>
      )}
    </div>
  );
}

export default QuestionBlock;