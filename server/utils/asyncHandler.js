const asyncHandler = (fn) => async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.error(error.message);
      res.status(error.status || 500).send({status:false, message: error.message});
    }
  };

  export default asyncHandler;