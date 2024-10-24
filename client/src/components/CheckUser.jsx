import React from 'react';

const CheckUser = ({ onStart }) => {
  return (
    <div>
      <h1>Добро пожаловать в астрологическое приложение!</h1>
      <button onClick={onStart}>/start</button>
    </div>
  );
};

export default CheckUser;