import axios from "axios";

const tableServiceApi = axios.create({
  baseURL: process.env.TABLE_SERVICE_URL || "http://localhost:3005/api/v1",
  timeout: 5000,
});

const paymentServiceApi = axios.create({
  baseURL:
    process.env.PAYMENT_SERVICE_URL || "http://localhost:3006/api/payments",
  timeout: 5000,
});
export { tableServiceApi, paymentServiceApi };
