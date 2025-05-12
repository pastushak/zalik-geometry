import React, { useMemo } from 'react';
import './styles/ExchangeQuestions.css';

function ExchangeQuestions({ onExchange, selectedQuestions, exchanges, selectedStudent }) {
  // Перевіряємо, чи використано вже обміни
  const getExchangeStatus = useMemo(() => {
    const studentExchanges = exchanges.filter(e => e.student === selectedStudent);
    
    const hardToNormalUsed = studentExchanges.some(e => e.exchangeType === 'hardToNormal');
    const normalToEasyUsed = studentExchanges.some(e => e.exchangeType === 'normalToEasy');
    
    // Перевіряємо, чи використаний БУДЬ-ЯКИЙ обмін
    const anyExchangeUsed = hardToNormalUsed || normalToEasyUsed;
    
    return {
      hardToNormalUsed,
      normalToEasyUsed,
      anyExchangeUsed
    };
  }, [exchanges, selectedStudent]);
  
  // Перевіряємо, чи є доступні питання для обміну
  const getAvailableQuestions = useMemo(() => {
    const studentQuestions = selectedQuestions.filter(q => q.student === selectedStudent && !q.isRemoved);
    
    const hardQuestions = studentQuestions.filter(q => q.level === 'hard' && !q.question.includes('ОБМІН'));
    const normalQuestions = studentQuestions.filter(q => q.level === 'normal' && !q.question.includes('ОБМІН'));
    
    return {
      hardAvailable: hardQuestions.length > 0,
      normalAvailable: normalQuestions.length > 0
    };
  }, [selectedQuestions, selectedStudent]);
  
  // Перевіряємо чи можна робити конкретний обмін
  // Якщо будь-який обмін вже використаний, інші стають недоступними
  const canUseHardToNormal = !getExchangeStatus.anyExchangeUsed && getAvailableQuestions.hardAvailable;
  const canUseNormalToEasy = !getExchangeStatus.anyExchangeUsed && getAvailableQuestions.normalAvailable;

  // Функція для відображення статусу
  const getStatusDisplay = (exchangeType) => {
    const isHardToNormal = exchangeType === 'hardToNormal';
    const isThisExchangeUsed = isHardToNormal ? getExchangeStatus.hardToNormalUsed : getExchangeStatus.normalToEasyUsed;
    const questionsAvailable = isHardToNormal ? getAvailableQuestions.hardAvailable : getAvailableQuestions.normalAvailable;
    
    if (isThisExchangeUsed) {
      return { type: 'used', text: '✅ Вже використано' };
    }
    
    if (getExchangeStatus.anyExchangeUsed && !isThisExchangeUsed) {
      return { type: 'unavailable', text: '🔒 Недоступно (інший обмін вже активовано)' };
    }
    
    if (!questionsAvailable) {
      const levelName = isHardToNormal ? 'Hard' : 'Normal';
      return { type: 'unavailable', text: `❌ Немає питань рівня ${levelName}` };
    }
    
    return { type: 'available', text: '✨ Доступно' };
  };

  return (
    <div className="exchange-questions">
      <div className="exchange-header">
        <h2>Опції обміну питань</h2>
        <p className="exchange-description">
          Ви можете обміняти одне складне питання на два простіше. <strong>Увага: можна використати тільки один обмін за весь залік!</strong>
        </p>
      </div>
      
      <div className="exchange-options">
        <div className={`exchange-option ${!canUseHardToNormal ? 'disabled' : ''}`}>
          <div className="exchange-card">
            <div className="exchange-icon">🔀</div>
            <div className="exchange-details">
              <h3>1 Hard → 2 Normal</h3>
              <p className="exchange-explanation">
                Обміняти одне питання рівня Hard на два питання рівня Normal
              </p>
              <div className="exchange-status">
                <span className={`status-${getStatusDisplay('hardToNormal').type}`}>
                  {getStatusDisplay('hardToNormal').text}
                </span>
              </div>
            </div>
            <button 
              onClick={() => onExchange('hardToNormal')} 
              disabled={!canUseHardToNormal}
              className="exchange-button"
            >
              {getExchangeStatus.hardToNormalUsed ? 'Використано' :
               getExchangeStatus.anyExchangeUsed ? 'Недоступно' :
               'Обміняти'}
            </button>
          </div>
        </div>
        
        <div className={`exchange-option ${!canUseNormalToEasy ? 'disabled' : ''}`}>
          <div className="exchange-card">
            <div className="exchange-icon">🔄</div>
            <div className="exchange-details">
              <h3>1 Normal → 2 Easy</h3>
              <p className="exchange-explanation">
                Обміняти одне питання рівня Normal на два питання рівня Easy
              </p>
              <div className="exchange-status">
                <span className={`status-${getStatusDisplay('normalToEasy').type}`}>
                  {getStatusDisplay('normalToEasy').text}
                </span>
              </div>
            </div>
            <button 
              onClick={() => onExchange('normalToEasy')} 
              disabled={!canUseNormalToEasy}
              className="exchange-button"
            >
              {getExchangeStatus.normalToEasyUsed ? 'Використано' :
               getExchangeStatus.anyExchangeUsed ? 'Недоступно' :
               'Обміняти'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="exchange-footer">
        <small>
          💡 Підказка: За весь залік можна використати тільки один тип обміну - або Hard на Normal, або Normal на Easy
        </small>
      </div>
    </div>
  );
}

export default ExchangeQuestions;