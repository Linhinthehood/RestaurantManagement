import express from "express";
import tableRoute from "./table.route.js";

const RootRoute = express.Router();

RootRoute.use("/tables", tableRoute);

export default RootRoute;
