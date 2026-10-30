// backend/src/utils/helpers.js

function paginate(page = 1, limit = 20) {
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  return { skip, take: limitNum, page: pageNum, limit: limitNum };
}

function successResponse(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

module.exports = {
  paginate,
  successResponse,
};