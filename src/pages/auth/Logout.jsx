import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear the authentication token
    localStorage.removeItem('token');
    
    // Redirect to login page
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800">Logging out...</h2>
      </div>
    </div>
  );
};

export default Logout;
