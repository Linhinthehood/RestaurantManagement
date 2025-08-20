import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';

import axios from 'axios';

const API_URL = 'http://localhost:3001/api/auth/users';

const CRUDPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = useMemo(() => [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Phone Number', accessorKey: 'phoneNumber' },
    { header: 'Gender', accessorKey: 'gender' },
    {
      header: 'Date of Birth',
      accessorKey: 'dob',
      Cell: ({ cell }) =>
        cell.getValue() ? new Date(cell.getValue()).toLocaleDateString() : '',
    },
  ], []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      setUsers(res.data?.data?.users || []);
    } catch (err) {
      console.error(err);
      alert('Error fetching user list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <MaterialReactTable
          columns={columns}
          data={users}
          localization={MRT_Localization_EN}
          editingMode="modal"
          enableEditing
          renderTopToolbarCustomActions={() => (
            <Button
              onClick={() =>
                setUsers(prev => [
                  ...prev,
                  { _id: Date.now().toString(), name: '', email: '', phoneNumber: '', gender: '', dob: '' },
                ])
              }
              variant="contained"
            >
              Add User
            </Button>
          )}
          renderRowActions={({ row, table }) => (
            <Box sx={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                onClick={() => table.setEditingRow(row)}
                variant="contained"
                size="small"
              >
                Edit
              </Button>
              <Button
                color="error"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this user?')) {
                    axios
                      .delete(`${API_URL}/${row.original._id}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
                      })
                      .then(() => setUsers(prev => prev.filter(u => u._id !== row.original._id)))
                      .catch(err => console.error(err));
                  }
                }}
                variant="contained"
                size="small"
              >
                Delete
              </Button>
            </Box>
          )}
          onEditingRowSave={({ row, values, exitEditingMode }) => {
            const isEdit = !!row.original._id;
            const request = isEdit
              ? axios.put(`${API_URL}/${row.original._id}`, values, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
                })
              : axios.post('http://localhost:3001/api/auth/register', values, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
                });

            request
              .then(res => {
                const updatedUser = res.data?.data?.user || res.data?.user;
                setUsers(prev => {
                  if (isEdit) return prev.map(u => (u._id === updatedUser._id ? updatedUser : u));
                  return [...prev, updatedUser];
                });
                exitEditingMode();
              })
              .catch(err => {
                console.error(err);
                alert('Error saving user');
              });
          }}
        />
      )}
    </>
  );
};

export default CRUDPage;
