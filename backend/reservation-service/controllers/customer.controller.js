import customerModel from "../models/customer.model.js";

const customerController = {
  // Tìm hoặc tạo customer
  findOrCreateCustomer: async (customerData) => {
    const { name, phone, email } = customerData;
    
    let customer = await customerModel.findOne({
      phone: phone,
      email: email,
    });
    
    if (!customer) {
      customer = await customerModel.create({
        name: name,
        phone: phone,
        email: email,
      });
    }
    
    return customer;
  },

  // Tìm customer theo phone
  getCustomerByPhone: async (req, res) => {
    try {
      const { phone } = req.params;
      const customer = await customerModel.findOne({ phone: phone });
      
      if (!customer) {
        return res.status(404).json({
          message: "Customer not found",
          success: false,
        });
      }
      
      res.status(200).json({
        message: "Customer found successfully",
        customer: customer,
        success: true,
      });
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },

  // Tìm customer theo email
  getCustomerByEmail: async (req, res) => {
    try {
      const { email } = req.params;
      const customer = await customerModel.findOne({ email: email });
      
      if (!customer) {
        return res.status(404).json({
          message: "Customer not found",
          success: false,
        });
      }
      
      res.status(200).json({
        message: "Customer found successfully",
        customer: customer,
        success: true,
      });
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },

  // Lấy tất cả customers
  getAllCustomers: async (req, res) => {
    try {
      const customers = await customerModel.find().sort({ createdAt: -1 });
      
      res.status(200).json({
        message: "Customers fetched successfully",
        customers: customers,
        success: true,
      });
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  },

  // Cập nhật customer
  updateCustomer: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const customer = await customerModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      if (!customer) {
        return res.status(404).json({
          message: "Customer not found",
          success: false,
        });
      }
      
      res.status(200).json({
        message: "Customer updated successfully",
        customer: customer,
        success: true,
      });
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  }
};

export default customerController; 