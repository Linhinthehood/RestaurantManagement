const parseDateTime = (dateStr, timeStr) => {
  return new Date(`${dateStr}T${timeStr}:00`);
};

export default parseDateTime;
