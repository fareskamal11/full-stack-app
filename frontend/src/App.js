import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [records, setRecords] = useState([]);
  const [newRecord, setNewRecord] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL || '/api';

  // Fetch records on component mount
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${apiUrl}/records`);
      setRecords(response.data);
    } catch (err) {
      console.error('Error fetching records:', err);
      setError('Failed to fetch records. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newRecord.trim()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${apiUrl}/records`, {
        content: newRecord
      });
      
      // Add the new record to the list
      setRecords([response.data, ...records]);
      setNewRecord('');
    } catch (err) {
      console.error('Error creating record:', err);
      setError('Failed to create record. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Records App</h1>
      </header>
      
      <main className="App-main">
        <section className="form-section">
          <h2>Add New Record</h2>
          
          <form onSubmit={handleSubmit} className="add-record-form">
            <div className="form-group">
              <input
                type="text"
                value={newRecord}
                onChange={(e) => setNewRecord(e.target.value)}
                placeholder="Enter record content..."
                disabled={isLoading}
                className="record-input"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading || !newRecord.trim()}
              className="add-button"
            >
              {isLoading ? 'Adding...' : 'Add Record'}
            </button>
          </form>
          
          {error && <div className="error-message">{error}</div>}
        </section>
        
        <section className="records-section">
          <h2>Records List</h2>
          
          {isLoading && <div className="loading">Loading...</div>}
          
          <ul className="records-list">
            {records.length > 0 ? (
              records.map(record => (
                <li key={record.id} className="record-item">
                  <div className="record-content">{record.content}</div>
                  <div className="record-date">
                    {new Date(record.created_at).toLocaleString()}
                  </div>
                </li>
              ))
            ) : (
              <li className="no-records">No records found</li>
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
