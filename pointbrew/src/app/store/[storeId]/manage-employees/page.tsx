'use client';

import './page.css'; // ✅ Agregar esta línea
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import MockupLayout from '@/components/MockupLayout';
import axios from 'axios';

interface Employee {
  user_id: number;
  full_name: string;
  email: string;
  image_url?: string;
  position?: string;
  hire_date: string;
  is_active: boolean;
  is_manager: boolean;
  created_at: string;
}

interface SearchUser {
  user_id: number;
  full_name: string;
  email: string;
  image_url?: string;
  role_name: string;
}

export default function ManageStoreEmployeesPage() {
  const { user, isAuthenticated, token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const storeId = params.storeId as string;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [newEmployeePosition, setNewEmployeePosition] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    fetchEmployees();
  }, [isAuthenticated, storeId]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/store-employees/${storeId}`);
      
      if (response.data.success) {
        setEmployees(response.data.data);
      } else {
        setError('Error al cargar empleados');
      }
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      setError('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await axios.get(`/api/store-employees/${storeId}/search?query=${encodeURIComponent(query)}`);
      
      if (response.data.success) {
        setSearchResults(response.data.data);
      }
    } catch (error: any) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!selectedUser) return;

    try {
      setSubmitting(true);
      setError('');
      
      const response = await axios.post(`/api/store-employees/${storeId}`, {
        userId: selectedUser.user_id,
        position: newEmployeePosition || 'Empleado'
      });

      if (response.data.success) {
        setSuccess('Empleado agregado exitosamente');
        setShowAddModal(false);
        setSelectedUser(null);
        setNewEmployeePosition('');
        setSearchQuery('');
        setSearchResults([]);
        fetchEmployees();
      } else {
        setError(response.data.message);
      }
    } catch (error: any) {
      console.error('Error adding employee:', error);
      setError(error.response?.data?.message || 'Error al agregar empleado');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveEmployee = async (userId: number) => {
    if (!confirm('¿Estás seguro de que quieres remover este empleado de la tienda?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/store-employees/${storeId}/${userId}`);
      
      if (response.data.success) {
        setSuccess('Empleado removido exitosamente');
        fetchEmployees();
      } else {
        setError(response.data.message);
      }
    } catch (error: any) {
      console.error('Error removing employee:', error);
      setError('Error al remover empleado');
    }
  };

  const toggleManagerStatus = async (employee: Employee) => {
    try {
      const response = await axios.put(`/api/store-employees/${storeId}/${employee.user_id}`, {
        position: employee.position,
        isManager: !employee.is_manager
      });

      if (response.data.success) {
        setSuccess(`${employee.full_name} ${!employee.is_manager ? 'promovido a' : 'removido como'} gerente`);
        fetchEmployees();
      } else {
        setError(response.data.message);
      }
    } catch (error: any) {
      console.error('Error updating employee:', error);
      setError('Error al actualizar empleado');
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    searchUsers(query);
  };

  if (loading) {
    return (
      <MockupLayout title="Administrar Empleados" showAuthButtons={true}>
        <div className="loading-container">
          <div className="loading">Cargando empleados...</div>
        </div>
      </MockupLayout>
    );
  }

  return (
    <MockupLayout title="Administrar Empleados" showAuthButtons={true}>
      <div className="manage-employees-container">
        <div className="header-section">
          <button 
            onClick={() => router.push('/store/manage-stores')}
            className="back-button"
          >
            ← Volver a Mis Tiendas
          </button>
          <h1>Administrar Empleados</h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className="add-employee-button"
          >
            + Agregar Empleado
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <div className="employees-grid">
          {employees.length === 0 ? (
            <div className="no-employees">
              <p>No hay empleados asignados a esta tienda.</p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="add-employee-button"
              >
                Agregar Primer Empleado
              </button>
            </div>
          ) : (
            employees.map((employee) => (
              <div key={employee.user_id} className="employee-card">
                <div className="employee-avatar">
                  {employee.image_url ? (
                    <img src={employee.image_url} alt={employee.full_name} />
                  ) : (
                    employee.full_name.charAt(0).toUpperCase()
                  )}
                </div>
                
                <div className="employee-info">
                  <h3>{employee.full_name}</h3>
                  <p className="employee-email">{employee.email}</p>
                  <p className="employee-position">{employee.position || 'Empleado'}</p>
                  <p className="employee-date">
                    Desde: {new Date(employee.hire_date).toLocaleDateString('es-ES')}
                  </p>
                  
                  {employee.is_manager && (
                    <span className="manager-badge">👑 Gerente</span>
                  )}
                </div>

                <div className="employee-actions">
                  <button
                    onClick={() => toggleManagerStatus(employee)}
                    className={`manager-toggle ${employee.is_manager ? 'remove-manager' : 'make-manager'}`}
                  >
                    {employee.is_manager ? '👑 Quitar Gerente' : '⬆️ Hacer Gerente'}
                  </button>
                  
                  <button
                    onClick={() => handleRemoveEmployee(employee.user_id)}
                    className="remove-button"
                  >
                    🗑️ Remover
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Employee Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Agregar Empleado</h2>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedUser(null);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="close-button"
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="search-section">
                  <label>Buscar empleado por nombre o email:</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Ingresa nombre o email..."
                    className="search-input"
                  />
                </div>

                {searching && <div className="searching">Buscando...</div>}

                {searchResults.length > 0 && (
                  <div className="search-results">
                    <h3>Resultados:</h3>
                    {searchResults.map((user) => (
                      <div 
                        key={user.user_id} 
                        className={`search-result-item ${selectedUser?.user_id === user.user_id ? 'selected' : ''}`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <div className="user-avatar">
                          {user.image_url ? (
                            <img src={user.image_url} alt={user.full_name} />
                          ) : (
                            user.full_name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="user-info">
                          <strong>{user.full_name}</strong>
                          <span>{user.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedUser && (
                  <div className="selected-user-section">
                    <h3>Usuario seleccionado:</h3>
                    <div className="selected-user">
                      <strong>{selectedUser.full_name}</strong>
                      <span>{selectedUser.email}</span>
                    </div>

                    <div className="position-section">
                      <label>Posición (opcional):</label>
                      <input
                        type="text"
                        value={newEmployeePosition}
                        onChange={(e) => setNewEmployeePosition(e.target.value)}
                        placeholder="Ej: Cajero, Cocinero, etc."
                        className="position-input"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedUser(null);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="cancel-button"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddEmployee}
                  disabled={!selectedUser || submitting}
                  className="confirm-button"
                >
                  {submitting ? 'Agregando...' : 'Agregar Empleado'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MockupLayout>
  );
}
