import React, { useMemo } from 'react';
import './styles/Statistics.css';
import { questions } from '../data/questions';

function Statistics({ selectedQuestions, exchanges, students }) {
  // Обчислюємо загальну статистику
  const stats = useMemo(() => {
    const studentStats = {};
    
    // Ініціалізуємо статистику для всіх учнів
    students.forEach(student => {
      studentStats[student] = {
        easy: 0,
        normal: 0,
        hard: 0,
        exchanges: {
          hardToNormal: 0,
          normalToEasy: 0
        },
        total: 0
      };
    });
    
    // Підраховуємо кількість питань за рівнями
    selectedQuestions.forEach(item => {
      if (!studentStats[item.student]) return;
      
      if (!item.question.includes('ОБМІН')) {
        // Визначаємо рівень питання
        if (questions.easy.includes(item.question)) {
          studentStats[item.student].easy++;
          studentStats[item.student].total++;
        } else if (questions.normal.includes(item.question)) {
          studentStats[item.student].normal++;
          studentStats[item.student].total++;
        } else if (questions.hard.includes(item.question)) {
          studentStats[item.student].hard++;
          studentStats[item.student].total++;
        }
      }
    });
    
    // Підраховуємо обміни
    exchanges.forEach(exchange => {
      if (!studentStats[exchange.student]) return;
      
      if (exchange.exchangeType === 'hardToNormal') {
        studentStats[exchange.student].exchanges.hardToNormal++;
      } else if (exchange.exchangeType === 'normalToEasy') {
        studentStats[exchange.student].exchanges.normalToEasy++;
      }
    });
    
    return studentStats;
  }, [selectedQuestions, exchanges, students]);
  
  // Кількість учнів з обраними питаннями
  const activeStudentsCount = useMemo(() => {
    return Object.values(stats).filter(stat => stat.total > 0).length;
  }, [stats]);
  
  // Загальна кількість обраних питань
  const totalQuestionsCount = useMemo(() => {
    return Object.values(stats).reduce((acc, stat) => acc + stat.total, 0);
  }, [stats]);

  return (
    <div className="statistics">
      <h2>Статистика</h2>
      
      <div className="stats-summary">
        <div className="stats-card">
          <h3>Загальна інформація</h3>
          <p><strong>Всього учнів:</strong> {students.length}</p>
          <p><strong>Активних учнів:</strong> {activeStudentsCount}</p>
          <p><strong>Обрано питань:</strong> {totalQuestionsCount}</p>
        </div>
      </div>
      
      <div className="stats-table-container">
        <table className="stats-table">
          <thead>
            <tr>
              <th>Учень</th>
              <th>Easy</th>
              <th>Normal</th>
              <th>Hard</th>
              <th>Обміни</th>
              <th>Всього</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student} className={stats[student].total > 0 ? 'active-student' : ''}>
                <td>{student}</td>
                <td>{stats[student].easy}</td>
                <td>{stats[student].normal}</td>
                <td>{stats[student].hard}</td>
                <td>
                  {stats[student].exchanges.hardToNormal > 0 && (
                    <div className="exchange-info">
                      <span className="exchange-label">H→N:</span> {stats[student].exchanges.hardToNormal}
                    </div>
                  )}
                  {stats[student].exchanges.normalToEasy > 0 && (
                    <div className="exchange-info">
                      <span className="exchange-label">N→E:</span> {stats[student].exchanges.normalToEasy}
                    </div>
                  )}
                  {stats[student].exchanges.hardToNormal === 0 && stats[student].exchanges.normalToEasy === 0 && '-'}
                </td>
                <td>{stats[student].total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Statistics;