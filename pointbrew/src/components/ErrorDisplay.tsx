'use client';

import React from 'react';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  showDetails?: boolean;
}

export default function ErrorDisplay({ error, onRetry, showDetails = false }: ErrorDisplayProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="error-container" style={{
      backgroundColor: '#FEF2F2',
      border: '1px solid #FECACA',
      borderRadius: '8px',
      padding: '16px',
      margin: '16px 0',
      color: '#991B1B'
    }}>
      <div className="error-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '20px', marginRight: '8px' }}>⚠️</span>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Error de Conexión</h3>
      </div>
      
      <p style={{ margin: '8px 0', fontSize: '14px' }}>
        {error}
      </p>

      {isDevelopment && showDetails && (
        <div className="error-details" style={{
          backgroundColor: '#FFF7ED',
          border: '1px solid #FED7AA',
          borderRadius: '4px',
          padding: '12px',
          marginTop: '12px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <strong>Detalles técnicos:</strong>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Verifica que el backend esté corriendo en el puerto 3001</li>
            <li>Ejecuta: <code>cd backend && npm run dev</code></li>
            <li>Verifica la configuración de CORS en el backend</li>
            <li>Revisa la consola del navegador para más detalles</li>
          </ul>
        </div>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            backgroundColor: '#DC2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            fontSize: '14px',
            cursor: 'pointer',
            marginTop: '12px'
          }}
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
