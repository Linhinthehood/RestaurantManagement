import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RegisterUserModal from './RegisterUserModal';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/auth/users';

const UserManagementTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openRegisterModal, setOpenRegisterModal] = useState(false);

  const columns = useMemo(
    () => [
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
    ],
    []
  );

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
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

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${API_URL}/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error(err);
      alert('Error deleting user');
    }
  };

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
          createDisplayMode="modal"
          enableEditing
          enableRowActions
          renderTopToolbarCustomActions={() => (
            <Button variant="contained" color="primary" onClick={() => setOpenRegisterModal(true)}>
              Add User
            </Button>
          )}
          renderRowActions={({ row, table }) => (
            <Box sx={{ display: 'flex', gap: '0.5rem' }}>
              <Tooltip title="Edit">
                <IconButton onClick={() => table.setEditingRow(row)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton color="error" onClick={() => handleDelete(row.original._id)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          onCreatingRowSave={async ({ values, exitEditingMode }) => {
            try {
              const res = await axios.post(
                'http://localhost:3000/api/auth/register',
                values,
                {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
                }
              );
              const newUser = res.data?.data?.user || res.data?.user;
              setUsers((prev) => [...prev, newUser]);
              exitEditingMode();
            } catch (err) {
              console.error(err);
              alert('Error creating user');
            }
          }}
          onEditingRowSave={async ({ row, values, exitEditingMode }) => {
            try {
              const res = await axios.put(
                `${API_URL}/${row.original._id}`,
                values,
                {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
                }
              );
              const updatedUser = res.data?.data?.user || res.data?.user;
              setUsers((prev) =>
                prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
              );
              exitEditingMode();
            } catch (err) {
              console.error(err);
              alert('Error updating user');
            }
          }}
        />
      )}

      <RegisterUserModal
        open={openRegisterModal}
        onClose={() => {
          setOpenRegisterModal(false);
          fetchUsers();
        }}
      />
    </>
  );
};

export default UserManagementTab;
