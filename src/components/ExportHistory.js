import React from 'react';
import './styles/ExportHistory.css';

function ExportHistory({ selectedQuestions, exchanges, onExportComplete }) {
  const handleExport = () => {
    try {
      // Підготовка змісту файлу
      let content = "ІСТОРІЯ ЗАЛІКУ З ГЕОМЕТРІЇ\n\n";
      
      // Групуємо питання за учнями
      const studentGroups = {};
      
      selectedQuestions.forEach(item => {
        if (!studentGroups[item.student]) {
          studentGroups[item.student] = [];
        }
        
        studentGroups[item.student].push({
          timestamp: item.timestamp,
          question: item.question,
          type: 'question'
        });
      });
      
      // Додаємо інформацію про обміни
      exchanges.forEach(exchange => {
        if (!studentGroups[exchange.student]) {
          studentGroups[exchange.student] = [];
        }
        
        studentGroups[exchange.student].push({
          timestamp: exchange.timestamp,
          exchangeType: exchange.exchangeType,
          type: 'exchange'
        });
      });
      
      // Форматуємо дані для кожного учня
      Object.keys(studentGroups).forEach(student => {
        content += `Учень: ${student}\n`;
        content += "=".repeat(50) + "\n\n";
        
        // Сортуємо за часом
        const sortedItems = studentGroups[student].sort((a, b) => 
          new Date('1970/01/01 ' + a.timestamp) - new Date('1970/01/01 ' + b.timestamp)
        );
        
        sortedItems.forEach(item => {
          if (item.type === 'question') {
            content += `[${item.timestamp}] Питання: ${item.question}\n`;
          } else if (item.type === 'exchange') {
            const exchangeText = item.exchangeType === 'hardToNormal' 
              ? "1 Hard → 2 Normal" 
              : "1 Normal → 2 Easy";
            content += `[${item.timestamp}] ОБМІН: ${exchangeText}\n`;
          }
        });
        
        content += "\n\n";
      });
      
      // Створення та завантаження файлу
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const date = new Date();
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getFullYear()}`;
      
      link.href = url;
      link.download = `zalik-geometriya-${formattedDate}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Викликаємо колбек про успішне завершення
      if (onExportComplete) {
        onExportComplete();
      }
    } catch (error) {
      console.error('Помилка збереження файлу:', error);
      // Тут можна було б викликати колбек з помилкою, але для простоти просто логуємо
    }
  };
  
  return (
    <div className="export-history">
      <button 
        onClick={handleExport} 
        className="export-button"
        disabled={selectedQuestions.length === 0}
      >
        Зберегти історію як .txt файл
      </button>
    </div>
  );
}

export default ExportHistory;