import React from 'react';  

const LoadingSpinner = () => {  
  return (  
    <div className="loading-spinner">  
      <p>Загрузка...</p>  
      <div className="spinner" />  
      <style jsx>{`  
        .loading-spinner {  
          display: flex;  
          flex-direction: column;  
          align-items: center;  
          justify-content: center;  
          height: 100vh;  
        }  
        .spinner {  
          border: 8px solid #f3f3f3; /* Цвет фона */  
          border-top: 8px solid #3498db; /* Цвет спиннера */  
          border-radius: 50%;  
          width: 50px;  
          height: 50px;  
          animation: spin 2s linear infinite;  
        }  
        @keyframes spin {  
          0% { transform: rotate(0deg); }  
          100% { transform: rotate(360deg); }  
        }  
      `}</style>  
    </div>  
  );  
};  

export default LoadingSpinner;  