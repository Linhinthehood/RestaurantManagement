import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button } from '@mui/material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import axios from 'axios';

const API_URL = '/api/auth/users';

const CRUDPage = () => {
  const [users, setUsers] = useState([]);

  // Columns definition using useMemo for performance
  const columns = useMemo(() => [
    { header: 'Tên', accessorKey: 'name' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Điện thoại', accessorKey: 'phoneNumber' },
    { header: 'Giới tính', accessorKey: 'gender' },
    {
      header: 'Ngày sinh',
      accessorKey: 'dob',
      Cell: ({ cell }) =>
        cell.getValue() ? new Date(cell.getValue()).toLocaleDateString() : '',
    },
  ], []);

  // Fetch users from API
  useEffect(() => {
    axios.get(API_URL)
      .then(res => setUsers(res.data.data.users))
      .catch(err => console.error(err));
  }, []);

  return (
    <MaterialReactTable
      columns={columns}
      data={users}
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
          Thêm người dùng
        </Button>
      )}
      renderRowActions={({ row, table }) => (
        <Box sx={{ display: 'flex', gap: '0.5rem' }}>
          <Button onClick={() => table.setEditingRow(row)} variant="contained" size="small">
            Sửa
          </Button>
          <Button
            color="error"
            onClick={() => {
              if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
                axios.delete(`${API_URL}/${row.original._id}`)
                  .then(() => setUsers(prev => prev.filter(u => u._id !== row.original._id)))
                  .catch(err => console.error(err));
              }
            }}
            variant="contained"
            size="small"
          >
            Xóa
          </Button>
        </Box>
      )}
      onEditingRowSave={({ row, values, exitEditingMode }) => {
        const isEdit = !!row.original._id;
        const request = isEdit
          ? axios.put(`${API_URL}/${row.original._id}`, values)
          : axios.post('/api/auth/register', values);

        request
          .then(res => {
            const updatedUser = res.data.user;
            setUsers(prev => {
              if (isEdit) return prev.map(u => (u._id === updatedUser._id ? updatedUser : u));
              return [...prev, updatedUser];
            });
            exitEditingMode();
          })
          .catch(err => console.error(err));
      }}
    />
  );
};

export default CRUDPage;
