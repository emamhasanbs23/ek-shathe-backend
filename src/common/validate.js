const validate = (schemas) => (req, res, next) => {
  // Back-compat: validate(joiSchema) still validates body only
  const map =
    schemas && typeof schemas.validate === "function"
      ? { body: schemas }
      : schemas || {};

  for (const key of ["params", "query", "body"]) {
    if (!map[key]) continue;
    const { error, value } = map[key].validate(req[key], {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      error.isJoi = true;
      return next(error);
    }
    req[key] = value;
  }
  return next();
};

module.exports = validate;
