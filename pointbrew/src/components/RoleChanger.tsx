'use client';
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const RoleChanger: React.FC = () => {
  const { user, updateUserRole } = useAuth();
  const [isChanging, setIsChanging] = useState(false);
  const [message, setMessage] = useState<string>('');

  if (!user) return null;

  // Don't show for Admin users
  if (user.role_name === 'Admin') return null;

  const handleRoleChange = async () => {
    const newRole = user.role_name === 'Customer' ? 'Employee' : 'Customer';
    
    setIsChanging(true);
    setMessage('');
    
    try {
      const result = await updateUserRole(newRole);
      
      if (result.success) {
        setMessage(`¡Rol actualizado exitosamente a ${newRole}!`);
      } else {
        setMessage(result.message || 'Error al cambiar el rol');
      }
    } catch (error) {
      setMessage('Error inesperado al cambiar el rol');
    } finally {
      setIsChanging(false);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  };

  const getButtonText = () => {
    if (isChanging) return 'Cambiando...';
    return user.role_name === 'Customer' 
      ? 'Convertirse en Empleado' 
      : 'Volver a Cliente';
  };

  const getButtonStyle = () => {
  const baseStyle = "px-6 py-2 rounded-full font-handwriting text-lg transition-all duration-200 disabled:opacity-50";

  if (user.role_name === 'Customer') {
    return `${baseStyle} bg-[#302014] hover:bg-[#2A1E15] text-white`;
  } else {
    return `${baseStyle} bg-[#302014] hover:bg-[#2A1E15] text-white`;
  }
};


  const getRoleDescription = () => {
    if (user.role_name === 'Customer') {
      return 'Como cliente puedes realizar pedidos y seguir tus turnos';
    } else {
      return 'Como empleado puedes gestionar turnos y atender órdenes';
    }
  };

  return (
    <div className="role-changer-container bg-white p-4 rounded-lg shadow-md border">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-800">
          Tu rol actual: <span className="text-blue-600">{user.role_name}</span>
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {getRoleDescription()}
        </p>
      </div>
      
      <button
        onClick={handleRoleChange}
        disabled={isChanging}
        className={getButtonStyle()}
      >
        {getButtonText()}
      </button>

      {message && (
        <div className={`mt-3 p-2 rounded text-sm ${
          message.includes('exitosamente') 
            ? 'bg-green-100 text-green-700 border border-green-300' 
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default RoleChanger;
