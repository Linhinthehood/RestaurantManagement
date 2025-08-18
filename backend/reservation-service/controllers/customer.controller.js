import customerModel from "../models/customer.model.js";

// Lấy customer theo ID
export const getCustomerById = async (req, res) => {
  try {
    const customer = await customerModel.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy tất cả customers
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await customerModel.find();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Tạo customer mới
export const createCustomer = async (req, res) => {
  try {
    const customer = new customerModel(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Cập nhật customer
export const updateCustomer = async (req, res) => {
  try {
    const customer = await customerModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Xóa customer
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await customerModel.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 