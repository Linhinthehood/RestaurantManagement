import React, { useEffect, useMemo, useState } from 'react';
import { tableService } from '../../services/tableService';

const initialForm = { name: '', capacity: 2, type: 'Normal' };

const TableManagementTab = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const filtered = useMemo(() => {
    return (tables || [])
      .filter(t => (typeFilter === 'All' ? true : (t.type || 'Normal') === typeFilter))
      .filter(t => (search ? (t.name || '').toLowerCase().includes(search.toLowerCase()) : true));
  }, [tables, search, typeFilter]);

  const openCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEdit = (table) => {
    setIsEditing(true);
    setCurrentId(table._id);
    setForm({ name: table.name || '', capacity: table.capacity || 2, type: table.type || 'Normal' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm(initialForm);
    setCurrentId(null);
    setIsEditing(false);
  };

  const fetchTables = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tableService.getTables();
      setTables(Array.isArray(res.tables) ? res.tables : (res.data || res));
    } catch (e) {
      setError('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEditing && currentId) {
        await tableService.updateTable(currentId, form);
      } else {
        await tableService.createTable(form);
      }
      await fetchTables();
      closeModal();
    } catch (e) {
      setError(e.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this table?')) return;
    try {
      setLoading(true);
      await tableService.deleteTable(id);
      await fetchTables();
    } catch (e) {
      setError(e.response?.data?.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Table Management</h2>
            <p className="text-sm text-gray-600">Create, edit and manage restaurant tables</p>
          </div>
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
              placeholder="Search by name..."
            />
            <select
              className="px-3 py-2 border rounded-lg text-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All types</option>
              <option value="Normal">Normal</option>
              <option value="VIP">VIP</option>
            </select>
            <button
              onClick={openCreate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              + New Table
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600 py-4">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((t) => (
              <div key={t._id} className="border rounded-xl p-4 hover:shadow transition">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-gray-500">#{t._id?.slice(-6)}</div>
                    <h3 className="text-lg font-semibold">{t.name}</h3>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => openEdit(t)}
                      className="px-3 py-1.5 text-sm rounded bg-gray-100 hover:bg-gray-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="px-3 py-1.5 text-sm rounded bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-700">
                  <div>Capacity: <span className="font-medium">{t.capacity}</span></div>
                  <div>Type: <span className="font-medium">{t.type || 'Normal'}</span></div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-500">No tables</div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={closeModal}></div>
          <form onSubmit={handleSubmit} className="relative bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold mb-4">{isEditing ? 'Edit Table' : 'Create Table'}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="E.g. A-01"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Capacity</label>
                <input
                  required
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="Normal">Normal</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={closeModal} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
                {isEditing ? 'Save' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TableManagementTab;
