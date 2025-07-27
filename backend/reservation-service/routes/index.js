import express from "express";
import reservationRoute from "./reservation.route.js";
import customerRoute from "./customer.route.js";

const RootRoute = express.Router();

RootRoute.use("/reservations", reservationRoute);
RootRoute.use("/customers", customerRoute);

export default RootRoute;
