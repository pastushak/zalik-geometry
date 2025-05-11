import React, { useState } from 'react';
import './styles/ExchangeQuestions.css';

function ExchangeQuestions({ onExchange, selectedStudent }) {
  const [exchangeType, setExchangeType] = useState('hardToNormal');

  const handleExchange = () => {
    onExchange(exchangeType);
  };

  return (
    <div className="exchange-questions">
      <h3>Обмін питань</h3>
      <div className="exchange-options">
        <div className="exchange-option">
          <input
            type="radio"
            id="hardToNormal"
            name="exchangeType"
            value="hardToNormal"
            checked={exchangeType === 'hardToNormal'}
            onChange={(e) => setExchangeType(e.target.value)}
          />
          <label htmlFor="hardToNormal">1 Hard → 2 Normal</label>
        </div>
        <div className="exchange-option">
          <input
            type="radio"
            id="normalToEasy"
            name="exchangeType"
            value="normalToEasy"
            checked={exchangeType === 'normalToEasy'}
            onChange={(e) => setExchangeType(e.target.value)}
          />
          <label htmlFor="normalToEasy">1 Normal → 2 Easy</label>
        </div>
      </div>
      <button onClick={handleExchange} className="exchange-button">
        Активувати обмін
      </button>
    </div>
  );
}

export default ExchangeQuestions;