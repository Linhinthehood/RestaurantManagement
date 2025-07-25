import React, { useState } from "react";
import { DatePicker, TimePicker, Card, Row, Col } from "antd";
import dayjs from "dayjs";

const AssignTable = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTime, setSelectedTime] = useState(dayjs());

  // Dummy data
  const reservations = [
    { id: 1, customerName: "Nguyen Van A", people: 4 },
    { id: 2, customerName: "Tran Thi B", people: 2 },
  ];

  const tables = [
    { id: 101, name: "Table 1", status: "available" },
    { id: 102, name: "Table 2", status: "occupied" },
    { id: 103, name: "Table 3", status: "reserved" },
  ];

  const getColorByStatus = (status) => {
    switch (status) {
      case "available":
        return "#a0d911";
      case "occupied":
        return "#f5222d";
      case "reserved":
        return "#fa8c16";
      default:
        return "#d9d9d9";
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Assign Table</h2>

      {/* Date/Time filter */}
      <div className="flex gap-4 mb-6">
        <DatePicker
          value={selectedDate}
          onChange={(val) => setSelectedDate(val)}
        />
        <TimePicker
          value={selectedTime}
          onChange={(val) => setSelectedTime(val)}
          format="HH:mm"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Table layout */}
        <div>
          <h3 className="text-lg font-medium mb-2">Table Layout</h3>
          <Row gutter={[16, 16]}>
            {tables.map((t) => (
              <Col key={t.id} span={8}>
                <Card
                  size="small"
                  style={{
                    backgroundColor: getColorByStatus(t.status),
                    color: "#fff",
                  }}
                  className="text-center shadow"
                >
                  <p>{t.name}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Right: Reservation List */}
        <div>
          <h3 className="text-lg font-medium mb-2">Reservations</h3>
          <div className="flex flex-col gap-3">
            {reservations.map((r) => (
              <Card key={r.id} size="small" className="shadow">
                <p>
                  <strong>{r.customerName}</strong>
                </p>
                <p>People: {r.people}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignTable;
