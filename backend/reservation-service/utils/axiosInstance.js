import axios from "axios";

const tableServiceApi = axios.create({
  baseURL: process.env.TABLE_SERVICE_URL,
  timeout: 5000,
});

const paymentServiceApi = axios.create({
  baseURL:
    process.env.PAYMENT_SERVICE_URL,
  timeout: 5000,
});
export { tableServiceApi, paymentServiceApi };
