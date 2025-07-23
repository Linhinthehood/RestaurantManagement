export const validateAssignTable = (req, res, next) => {
  const { tableId } = req.body;
  if (!tableId) {
    return res.status(400).json({
      message: "Table ID is required",
      success: false,
    });
  }
  next();
};
