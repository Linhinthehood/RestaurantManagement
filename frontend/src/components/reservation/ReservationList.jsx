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
  Form,
} from "antd";
import reservationService from "../../services/reservationService";
import ReservationStatusFilter from "./ReservationStatusFilter";

const ReservationList = ({
  reservations,
  selectedDate,
  selectedTime,
  onReservationChanged,
  filterStatus,
  setFilterStatus,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const initialDateTime = dayjs().startOf("hour");

  const [formData, setFormData] = useState({
    customerName: "",
    quantity: 1,
    reservationDateTime: initialDateTime,
    note: "",
  });

  // const filtered = reservations.filter((r) =>
  //   filterStatus === "All" ? true : r.status === filterStatus
  // );

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
        <ReservationStatusFilter
          currentStatus={filterStatus}
          onChange={setFilterStatus}
        />
        <div className="h-[350px] overflow-y-auto pr-2 custom-scroll">
          {reservations.length > 0 ? (
            reservations.map((rsv) => (
              <ReservationListItem
                key={rsv._id}
                rsv={rsv}
                onReservationChanged={onReservationChanged}
              />
            ))
          ) : (
            <p>No reservations for this slot.</p>
          )}
        </div>
      </div>
      <Modal
        title="Create Walk-in Reservation"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleCreateWalkIn}
        okText="Create"
        cancelText="Cancel"
        centered
      >
        <Form layout="vertical">
          {/* Number of Guests */}
          <Form.Item label="Number of Guests">
            <InputNumber
              min={1}
              value={formData.quantity}
              onChange={(val) => setFormData({ ...formData, quantity: val })}
              className="w-full"
              placeholder="Enter number of guests"
            />
          </Form.Item>

          {/* Date */}
          <Form.Item label="Reservation Date">
            <DatePicker
              value={formData.reservationDateTime}
              onChange={(date) => {
                const newDateTime = date
                  .hour(formData.reservationDateTime.hour())
                  .minute(0)
                  .second(0);
                setFormData({ ...formData, reservationDateTime: newDateTime });
              }}
              className="w-full"
              format="YYYY-MM-DD"
            />
          </Form.Item>

          {/* Time */}
          <Form.Item label="Reservation Time">
            <TimePicker
              value={formData.reservationDateTime}
              onChange={(time) => {
                const newDateTime = formData.reservationDateTime
                  .hour(time.hour())
                  .minute(0)
                  .second(0);
                setFormData({ ...formData, reservationDateTime: newDateTime });
              }}
              className="w-full"
              format="HH:mm"
            />
          </Form.Item>

          {/* Note */}
          <Form.Item label="Notes (optional)">
            <Input.TextArea
              placeholder="Enter notes..."
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReservationList;
