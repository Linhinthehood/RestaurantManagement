import React, { useState } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Button, MenuItem, Select, InputLabel,
  FormControl, FormHelperText
} from '@mui/material';
import axios from 'axios';

const roles = ['Manager', 'Waiter', 'Chef', 'Receptionist'];
const genders = ['Male', 'Female', 'Other'];

const RegisterUserModal = ({ open, onClose }) => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phoneNumber: '',
    dob: '', gender: '', role: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!/^[0-9]{10,11}$/.test(form.phoneNumber)) errs.phoneNumber = 'Invalid phone number';
    if (!form.dob) errs.dob = 'Date of birth is required';
    if (!form.gender) errs.gender = 'Gender is required';
    if (!form.role) errs.role = 'Role is required';
    return errs;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      setMessage('');
      return;
    }

    try {
      const payload = { ...form };
      const res = await axios.post('http://localhost:3000/api/auth/register', payload);
      setMessage(res.data.message);
      setErrors({});
      setForm({
        name: '', email: '', password: '', phoneNumber: '',
        dob: '', gender: '', role: ''
      });
    } catch (err) {
      setMessage(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Register User</DialogTitle>
      <DialogContent>
        <form onSubmit={onSubmit} noValidate>
          <TextField
            name="name" label="Name" value={form.name} onChange={handleInputChange}
            fullWidth margin="normal" error={!!errors.name} helperText={errors.name}
          />
          <TextField
            name="email" label="Email" value={form.email} onChange={handleInputChange}
            fullWidth margin="normal" error={!!errors.email} helperText={errors.email}
          />
          <TextField
            name="password" label="Password" type="password" value={form.password} onChange={handleInputChange}
            fullWidth margin="normal" error={!!errors.password} helperText={errors.password}
          />
          <TextField
            name="phoneNumber" label="Phone Number" value={form.phoneNumber} onChange={handleInputChange}
            fullWidth margin="normal" error={!!errors.phoneNumber} helperText={errors.phoneNumber}
          />
          <TextField
            name="dob" label="Date of Birth" type="date" value={form.dob} onChange={handleInputChange}
            fullWidth margin="normal" InputLabelProps={{ shrink: true }} error={!!errors.dob} helperText={errors.dob}
          />
          <FormControl fullWidth margin="normal" error={!!errors.gender}>
            <InputLabel id="gender-label">Gender</InputLabel>
            <Select
              labelId="gender-label" name="gender" value={form.gender} onChange={handleInputChange}
            >
              {genders.map((gender) => (
                <MenuItem key={gender} value={gender}>{gender}</MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.gender}</FormHelperText>
          </FormControl>
          <FormControl fullWidth margin="normal" error={!!errors.role}>
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label" name="role" value={form.role} onChange={handleInputChange}
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>{role}</MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.role}</FormHelperText>
          </FormControl>
          {message && (
            <p style={{ color: message.includes('error') ? 'red' : 'green' }}>
              {message}
            </p>
          )}
          <DialogActions>
            <Button onClick={onClose} color="primary">Cancel</Button>
            <Button type="submit" color="primary">Register</Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterUserModal;
