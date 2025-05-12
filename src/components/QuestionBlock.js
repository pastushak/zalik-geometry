import React, { useState, useCallback, memo, useMemo, useEffect } from 'react';
import './styles/QuestionBlock.css';

const QuestionBlock = memo(function QuestionBlock({ 
  title, 
  questions, 
  onQuestionSelected,
  level,
  blockedQuestions = [],
  additionalSlots = 0,
  removedQuestions = [],
  exchanges = [],
  resetTrigger = 0,
  studentChangeTrigger = 0 // Новий проп для зміни учня
}) {
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [animating, setAnimating] = useState(false);
  
  // Реагуємо на скидання питань
  useEffect(() => {
    if (resetTrigger > 0) {
      setSelectedQuestions([]);
    }
  }, [resetTrigger]);
  
  // Реагуємо на зміну учня - завжди очищуємо карточки
  useEffect(() => {
    if (studentChangeTrigger > 0) {
      setSelectedQuestions([]);
    }
  }, [studentChangeTrigger]);
  
  // Відновлюємо питання для поточного учня з blockedQuestions
  useEffect(() => {
    // Коли змінюються blockedQuestions, це означає що завантажуються дані для іншого учня
    // Потрібно встановити selectedQuestions відповідно до blockedQuestions
    if (blockedQuestions.length > 0) {
      const questionsFromThisLevel = blockedQuestions.filter(q => questions.includes(q));
      setSelectedQuestions(questionsFromThisLevel);
    }
  }, [blockedQuestions, questions]);
  
  // Перевіряємо, чи було зроблено обмін з цього рівня
  const wasExchangedFrom = useMemo(() => {
    return exchanges.some(exchange => 
      exchange.fromLevel === level
    );
  }, [exchanges, level]);
  
  // Підраховуємо, скільки питань можна ще обрати
  const totalSlotsAvailable = 1 + additionalSlots;
  const questionsChosen = selectedQuestions.filter(q => !removedQuestions.includes(q)).length;
  const slotsRemaining = totalSlotsAvailable - questionsChosen;
  
  // Перевіряємо, чи можна обирати ще питання
  // Якщо було зроблено обмін з цього рівня, кнопка залишається заблокованою
  const canSelectMore = slotsRemaining > 0 && !wasExchangedFrom;

  const handleSelectQuestion = useCallback(() => {
    if (!canSelectMore || animating) return;
    
    // Фільтруємо питання, які ще не були обрані глобально
    const availableQuestions = questions.filter(q => !blockedQuestions.includes(q));
    
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
      setSelectedQuestions(prev => [...prev, question]);
      
      // Передаємо обране питання наверх з інформацією про рівень
      onQuestionSelected(question, level);
    }, 300);
  }, [canSelectMore, animating, questions, blockedQuestions, onQuestionSelected, level]);

  return (
    <div className={`question-block ${animating ? 'question-animating' : ''}`}>
      <h2>{title}</h2>
      
      {/* Інформація про додаткові слоти */}
      {additionalSlots > 0 && (
        <div className="additional-slots-info">
          <span className="bonus-icon">🎁</span>
          Додаткових слотів: {additionalSlots}
        </div>
      )}
      
      {/* Інформація про блокування після обміну */}
      {wasExchangedFrom && (
        <div className="exchange-blocked-info">
          <span className="warning-icon">⚠️</span>
          Рівень заблоковано після обміну
        </div>
      )}
      
      {/* Кнопка вибору */}
      <button 
        onClick={handleSelectQuestion} 
        disabled={!canSelectMore || animating}
        className={!canSelectMore ? 'disabled' : ''}
      >
        {animating ? 'Обираємо...' : 
         wasExchangedFrom ? 'Заблоковано (обміняно)' :
         slotsRemaining === 0 ? `Всі питання обрані (${questionsChosen}/${totalSlotsAvailable})` : 
         `Обрати питання (${slotsRemaining} залишилось)`}
      </button>
      
      {/* Відображення обраних питань */}
      <div className="selected-questions-container">
        {selectedQuestions.map((question, index) => (
          <div 
            key={index} 
            className={`selected-question ${removedQuestions.includes(question) ? 'removed' : ''}`}
          >
            <h3>Питання {index + 1}:</h3>
            <p>{question}</p>
            {removedQuestions.includes(question) && (
              <div className="removed-label">Обміняно</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

export default QuestionBlock;