import React, { useState, useEffect } from "react";
import axios from "axios";
import ReservationListItem from "./ReservationListItem";
import dayjs from "dayjs";
import {
  Button,
  DatePicker,
  Input,
  InputNumber,
  message,
  Modal,
  TimePicker,
} from "antd";
import reservationService from "../../services/reservationService";

const ReservationList = ({
  reservations,
  selectedDate,
  selectedTime,
  refreshTrigger,
  onReservationChanged,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const initialDateTime = dayjs().startOf("hour");

  const [formData, setFormData] = useState({
    customerName: "",
    quantity: 1,
    reservationDateTime: initialDateTime,
    note: "",
  });

  const handleCreateWalkIn = async () => {
    try {
      const res = await reservationService.createReservation({
        customerName: formData.customerName || null,
        quantity: formData.quantity,
        dateStr: formData.reservationDateTime.format("YYYY-MM-DD"),
        timeStr: formData.reservationDateTime.format("HH:mm"),
        note: formData.note || null,
        isWalkIn: true,
      });
      message.success(res.message);
      setIsModalVisible(false);
      onReservationChanged();
    } catch (error) {
      message.error(
        error.response?.data.message || "Failed to create reservation"
      );
    }
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            📋 Reservation List
          </h2>
          <p className="text-center text-sm font-light text-gray-600">
            {selectedDate.toLocaleDateString("vi-VN")} {selectedTime}
          </p>
        </div>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          + Walk-in
        </Button>
      </div>

      <div className="space-y-4">
        {reservations.length > 0 ? (
          reservations.map((rsv) => (
            <ReservationListItem
              key={rsv._id}
              rsv={rsv}
              onUnassigned={onReservationChanged}
            />
          ))
        ) : (
          <p>No reservations for this slot.</p>
        )}
      </div>
      <Modal
        title="Tạo đơn Walk-in"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleCreateWalkIn}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Input
          placeholder="Tên khách"
          value={formData.customerName}
          onChange={(e) =>
            setFormData({ ...formData, customerName: e.target.value })
          }
          className="mb-2"
        />
        <InputNumber
          min={1}
          value={formData.quantity}
          onChange={(val) => setFormData({ ...formData, quantity: val })}
          className="mb-2 w-full"
          placeholder="Số khách"
        />
        <DatePicker
          // Value nhận vào là đối tượng dayjs
          value={formData.reservationDateTime}
          onChange={(date) => {
            // date ở đây đã là một đối tượng dayjs hợp lệ
            const newDateTime = date
              .hour(formData.reservationDateTime.hour())
              .minute(0)
              .second(0);
            setFormData({ ...formData, reservationDateTime: newDateTime });
          }}
          className="mb-2 w-full"
          format="YYYY-MM-DD"
        />
        <TimePicker
          // Value nhận vào là đối tượng dayjs
          value={formData.reservationDateTime}
          onChange={(time) => {
            // time ở đây đã là một đối tượng dayjs hợp lệ
            const newDateTime = formData.reservationDateTime
              .hour(time.hour())
              .minute(0) // Đảm bảo phút luôn là 0
              .second(0);
            setFormData({ ...formData, reservationDateTime: newDateTime });
          }}
          className="mb-2 w-full"
          format="HH"
        />
        <Input.TextArea
          placeholder="Ghi chú"
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
        />
      </Modal>
    </div>
  );
};

export default ReservationList;
