import React, { memo } from 'react';
import './styles/StudentSelector.css';
import { students } from '../data/students';

const StudentSelector = memo(function StudentSelector({ selectedStudent, onStudentSelect }) {
  return (
    <div className="student-selector">
      <label htmlFor="student-select">Оберіть учня:</label>
      <select 
        id="student-select" 
        value={selectedStudent || ''}
        onChange={(e) => onStudentSelect(e.target.value)}
      >
        <option value="">-- Оберіть учня --</option>
        {students.map((student, index) => (
          <option key={index} value={student}>
            {student}
          </option>
        ))}
      </select>
    </div>
  );
});

export default StudentSelector;