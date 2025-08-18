import React, { useState } from "react";
import axios from "axios";
import Select, { components } from "react-select";
import {
  FaUserTie,
  FaUser,
  FaUtensils,
  FaUserClock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const roles = [
  { value: "Manager", label: "Quản lý", icon: <FaUserTie /> },
  { value: "Waiter", label: "Phục vụ", icon: <FaUser /> },
  { value: "Chef", label: "Đầu bếp", icon: <FaUtensils /> },
  { value: "Receptionist", label: "Lễ tân", icon: <FaUserClock /> },
];
const genders = [
  { value: "Male", label: "Nam" },
  { value: "Female", label: "Nữ" },
  { value: "Other", label: "Khác" },
];

const CustomSingleValue = ({ data }) => (
  <div className="flex items-center gap-2">
    {data.icon && <span>{data.icon}</span>}
    <span>{data.label}</span>
  </div>
);
const CustomOption = (props) => (
  <components.Option {...props}>
    <div className="flex items-center gap-2">
      {props.data.icon && <span>{props.data.icon}</span>}
      <span>{props.data.label}</span>
    </div>
  </components.Option>
);

export default function RegisterUserPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    dob: "",
    gender: null,
    role: null,
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (opt, action) => {
    setForm((prev) => ({ ...prev, [action.name]: opt }));
    setErrors((prev) => ({ ...prev, [action.name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Tên là bắt buộc";
    if (form.name.length > 50) errs.name = "Tên không được quá 50 ký tự";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Email không hợp lệ";
    if (form.password.length < 6) errs.password = "Mật khẩu ≥ 6 ký tự";
    if (!/^[0-9]{10,11}$/.test(form.phoneNumber))
      errs.phoneNumber = "Số điện thoại không hợp lệ";
    if (!form.dob) errs.dob = "Ngày sinh là bắt buộc";
    else if (new Date(form.dob) > new Date())
      errs.dob = "Ngày sinh không thể là tương lai";
    if (!form.gender) errs.gender = "Giới tính là bắt buộc";
    if (!form.role) errs.role = "Vai trò là bắt buộc";
    return errs;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      setMessage("");
      return;
    }

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber,
        dob: form.dob,
        gender: form.gender.value,
        role: form.role.value,
      };
      const res = await axios.post(
        "http://localhost:3000/api/auth/register",
        payload
      );
      setMessage(res.data.message);
      setErrors({});
      setForm({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        dob: "",
        gender: null,
        role: null,
      });
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
        setMessage(err.response.data.message || "");
      } else {
        setMessage(err.response?.data?.message || "Có lỗi xảy ra");
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow-md">
      <h2 className="text-3xl font-semibold text-center mb-6">
        Đăng ký tài khoản
      </h2>
      {message && (
        <div
          className={`mb-4 p-3 rounded text-white text-center ${
            message.toLowerCase().includes("thành công")
              ? "bg-green-500"
              : "bg-red-500"
          }`}
        >
          {message}
        </div>
      )}
      <form onSubmit={onSubmit} noValidate>
        {/* Name */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Tên</label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Nhập tên"
          />
          {errors.name && (
            <p className="text-red-600 mt-1 text-sm">{errors.name}</p>
          )}
        </div>
        {/* Email */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Nhập email"
          />
          {errors.email && (
            <p className="text-red-600 mt-1 text-sm">{errors.email}</p>
          )}
        </div>
        {/* Password */}
        <div className="mb-4 relative">
          <label className="block mb-1 font-medium">Mật khẩu</label>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Nhập mật khẩu"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-600 hover:text-gray-900"
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          {errors.password && (
            <p className="text-red-600 mt-1 text-sm">{errors.password}</p>
          )}
        </div>
        {/* Phone */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Số điện thoại</label>
          <input
            name="phoneNumber"
            type="tel"
            value={form.phoneNumber}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded ${
              errors.phoneNumber ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Nhập số điện thoại"
          />
          {errors.phoneNumber && (
            <p className="text-red-600 mt-1 text-sm">{errors.phoneNumber}</p>
          )}
        </div>
        {/* DOB */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Ngày sinh</label>
          <input
            name="dob"
            type="date"
            value={form.dob}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded ${
              errors.dob ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.dob && (
            <p className="text-red-600 mt-1 text-sm">{errors.dob}</p>
          )}
        </div>
        {/* Gender */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Giới tính</label>
          <Select
            name="gender"
            options={genders}
            value={form.gender}
            onChange={handleSelectChange}
            placeholder="Chọn giới tính"
            classNamePrefix={
              errors.gender ? "react-select-error" : "react-select"
            }
          />
          {errors.gender && (
            <p className="text-red-600 mt-1 text-sm">{errors.gender}</p>
          )}

          {errors.gender && (
            <p className="text-red-600 mt-1 text-sm">{errors.gender}</p>
          )}
        </div>
        {/* Role */}
        <div className="mb-6">
          <label className="block mb-1 font-medium">Vai trò</label>
          <Select
            name="role"
            options={roles}
            value={form.role}
            onChange={handleSelectChange}
            placeholder="Chọn vai trò"
            components={{
              SingleValue: CustomSingleValue,
              Option: CustomOption,
            }}
            classNamePrefix={
              errors.role ? "react-select-error" : "react-select"
            }
          />
          {errors.role && (
            <p className="text-red-600 mt-1 text-sm">{errors.role}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition"
        >
          Đăng ký
        </button>
      </form>
    </div>
  );
}
