const parseDateTime = (dateStr, timeStr) => {
  return new Date(`${dateStr}T${timeStr}:00.000Z`);
};

export default parseDateTime;
