import React, { useEffect, useState } from 'react';
import { discountService } from '../../services/discountService';

const DiscountManagementTab = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [form, setForm] = useState({ discountPercentage: '', quantity: '' });
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const res = await discountService.getAll();
      if (res.success) setDiscounts(res.data || []);
      else setError(res.message || 'Failed to load discounts');
    } catch (e) {
      setError('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ discountPercentage: '', quantity: '' });
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const discountPercentage = Number(form.discountPercentage);
    const quantity = Number(form.quantity);
    if (!discountPercentage || discountPercentage < 1 || discountPercentage > 100) {
      setError('Discount percentage must be between 1 and 100');
      return;
    }
    if (!quantity || quantity < 1) {
      setError('Quantity must be greater than 0');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (editing) {
        const res = await discountService.update(editing._id, { discountPercentage, quantity });
        if (res.success) {
          setSuccess('Discount updated successfully');
          await fetchDiscounts();
          resetForm();
        } else {
          setError(res.message || 'Update failed');
        }
      } else {
        const res = await discountService.create({ discountPercentage, quantity });
        if (res.success) {
          setSuccess('Discount created successfully');
          await fetchDiscounts();
          resetForm();
        } else {
          setError(res.message || 'Create failed');
        }
      }
    } catch (err) {
      setError('Request failed');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(null), 1500);
    }
  };

  const handleEdit = (discount) => {
    setEditing(discount);
    setForm({
      discountPercentage: discount.discountPercentage,
      quantity: discount.quantity,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this discount?')) return;
    try {
      const res = await discountService.remove(id);
      if (res.success) {
        setSuccess('Discount deleted');
        await fetchDiscounts();
      } else {
        setError(res.message || 'Delete failed');
      }
    } catch (e) {
      setError('Delete request failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Create / Edit Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">{editing ? 'Edit Discount' : 'Create Discount'}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Discount Percentage (%)</label>
            <input
              name="discountPercentage"
              type="number"
              min={1}
              max={100}
              value={form.discountPercentage}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. 10"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Quantity</label>
            <input
              name="quantity"
              type="number"
              min={1}
              value={form.quantity}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. 100"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 rounded text-white ${submitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {editing ? 'Update' : 'Create'}
            </button>
            {editing && (
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded border">Cancel</button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Discounts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Used</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td className="px-6 py-4" colSpan={6}>Loading...</td></tr>
              ) : discounts.length === 0 ? (
                <tr><td className="px-6 py-4 text-gray-500" colSpan={6}>No discounts found</td></tr>
              ) : (
                discounts.map((d) => (
                  <tr key={d._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-mono">{d.discountCode}</td>
                    <td className="px-6 py-4">{d.discountPercentage}%</td>
                    <td className="px-6 py-4">{d.quantity}</td>
                    <td className="px-6 py-4">{d.usedCount || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${d.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{d.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleEdit(d)} className="px-3 py-1 text-sm rounded bg-yellow-100 hover:bg-yellow-200">Edit</button>
                      <button onClick={() => handleDelete(d._id)} className="px-3 py-1 text-sm rounded bg-red-100 hover:bg-red-200">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DiscountManagementTab;


