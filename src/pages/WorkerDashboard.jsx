import React, { useState, useEffect } from 'react';
import { FaTasks, FaCheckCircle, FaClock, FaExclamationCircle, FaUser, FaEnvelope, FaPhone, FaEdit, FaTrash } from 'react-icons/fa';
import { useProductContext } from '../context/ProductContext';
import './WorkerDashboard.css';

/**
 * WorkerDashboard - Dashboard for workers to view and manage assigned tasks
 * Workers can only view tasks assigned to them, not the full admin dashboard
 */
const WorkerDashboard = () => {
  const { user, getWorkerTasks, updateWorkerTask, orders, updateOrderStatus, orderStatuses } = useProductContext();
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks');
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (user?.email) {
      const workerTasks = getWorkerTasks(user.email);
      setTasks(workerTasks);
    }
  }, [user, getWorkerTasks]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#f59e0b';
      case 'pending': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <FaCheckCircle />;
      case 'in_progress': return <FaClock />;
      case 'pending': return <FaExclamationCircle />;
      default: return <FaClock />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get orders that can be managed by this worker
  const managedOrders = orders.filter(order => 
    order.status !== 'Delivered' && order.status !== 'Cancelled'
  );

  const handleTaskStatusChange = (taskId, newStatus) => {
    updateWorkerTask(taskId, { status: newStatus });
    // Refresh tasks
    const workerTasks = getWorkerTasks(user.email);
    setTasks(workerTasks);
  };

  const handleOrderStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const getTaskStats = () => {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    return { completed, inProgress, pending, total: tasks.length };
  };

  const stats = getTaskStats();

  return (
    <div className="worker-dashboard-container">
      <div className="worker-dashboard-header">
        <div className="header-info">
          <h1><FaTasks /> Worker Dashboard</h1>
          <p>Welcome back, {user?.name || user?.email.split('@')[0]}!</p>
        </div>
        <div className="worker-info-card">
          <FaUser className="worker-avatar" />
          <div className="worker-details">
            <span className="worker-name">{user?.name}</span>
            <span className="worker-email">{user?.email}</span>
            <span className="worker-role">Worker</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card pending">
          <div className="stat-icon"><FaClock /></div>
          <div className="stat-info">
            <span className="stat-number">{stats.pending}</span>
            <span className="stat-label">Pending Tasks</span>
          </div>
        </div>
        <div className="stat-card progress">
          <div className="stat-icon"><FaClock /></div>
          <div className="stat-info">
            <span className="stat-number">{stats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
        <div className="stat-card completed">
          <div className="stat-icon"><FaCheckCircle /></div>
          <div className="stat-info">
            <span className="stat-number">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        <div className="stat-card orders">
          <div className="stat-icon"><FaTasks /></div>
          <div className="stat-info">
            <span className="stat-number">{managedOrders.length}</span>
            <span className="stat-label">Active Orders</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <FaTasks /> My Tasks
        </button>
        <button 
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <FaCheckCircle /> Order Management
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'tasks' && (
          <div className="tasks-section">
            {tasks.length === 0 ? (
              <div className="empty-state">
                <FaTasks className="empty-icon" />
                <h3>No tasks assigned</h3>
                <p>You don't have any tasks assigned yet.</p>
              </div>
            ) : (
              <div className="tasks-list">
                {tasks.map(task => (
                  <div key={task.id} className="task-card">
                    <div className="task-header">
                      <div className="task-type">{task.type}</div>
                      <div 
                        className="task-status"
                        style={{ backgroundColor: getStatusColor(task.status) }}
                      >
                        {getStatusIcon(task.status)}
                        <span>{task.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="task-body">
                      <h3>{task.title}</h3>
                      <p>{task.description}</p>
                      <div className="task-meta">
                        <span><FaClock /> Assigned: {formatDate(task.assignedAt)}</span>
                        {task.dueDate && <span>Due: {formatDate(task.dueDate)}</span>}
                      </div>
                    </div>
                    <div className="task-actions">
                      {task.status !== 'completed' && (
                        <>
                          <button 
                            className="action-btn start"
                            onClick={() => handleTaskStatusChange(task.id, 'in_progress')}
                          >
                            <FaClock /> Start
                          </button>
                          <button 
                            className="action-btn complete"
                            onClick={() => handleTaskStatusChange(task.id, 'completed')}
                          >
                            <FaCheckCircle /> Complete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-section">
            <div className="section-header">
              <h2>Order Management</h2>
              <p>Update order status as you complete tasks</p>
            </div>
            
            {managedOrders.length === 0 ? (
              <div className="empty-state">
                <FaCheckCircle className="empty-icon" />
                <h3>No active orders</h3>
                <p>All orders have been delivered or cancelled.</p>
              </div>
            ) : (
              <div className="orders-table-container">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Current Status</th>
                      <th>Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managedOrders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>
                          <div className="customer-cell">
                            <span className="customer-name">{order.shippingAddress?.name || order.userName}</span>
                            <span className="customer-email">{order.userEmail}</span>
                          </div>
                        </td>
                        <td>{order.items?.length || 0}</td>
                        <td className="order-total">₹{order.total?.toFixed(2)}</td>
                        <td>
                          <span 
                            className="status-badge"
                            style={{ 
                              backgroundColor: order.status === 'Cancelled' ? '#fee' : '#e8f5e9',
                              color: order.status === 'Cancelled' ? '#f44336' : '#4caf50'
                            }}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <select 
                            className="status-select"
                            value={order.status}
                            onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                          >
                            {orderStatuses.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerDashboard;
