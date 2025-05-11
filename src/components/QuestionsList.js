import React from 'react';
import './QuestionsList.css';

function QuestionsList({ selectedQuestions }) {
  if (selectedQuestions.length === 0) {
    return <div className="questions-list">Питання ще не обирались</div>;
  }

  return (
    <div className="questions-list">
      <h2>Історія обраних питань</h2>
      <table className="questions-table">
        <thead>
          <tr>
            <th>Час</th>
            <th>Учень</th>
            <th>Питання</th>
          </tr>
        </thead>
        <tbody>
          {selectedQuestions.map((item, index) => (
            <tr key={index}>
              <td>{item.timestamp}</td>
              <td>{item.student}</td>
              <td>{item.question}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default QuestionsList;