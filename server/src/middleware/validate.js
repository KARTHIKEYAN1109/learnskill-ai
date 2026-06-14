import { validationResult } from 'express-validator';
import ApiError from '../utils/apiError.js';

const validate = (req, _res, next) => {
  const errors = validationResult(req);

  console.log('BODY RECEIVED:', req.body);

  if (!errors.isEmpty()) {
    console.log('VALIDATION ERRORS:', errors.array());

    return next(
      new ApiError(422, 'Validation failed', errors.array())
    );
  }

  next();
};

export default validate;
