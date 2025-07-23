import express from "express";
import reservationRoute from "./reservation.route.js";

const RootRoute = express.Router();

RootRoute.use("/reservations", reservationRoute);

export default RootRoute;
