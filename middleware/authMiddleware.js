import JWT from "jsonwebtoken";

//Protected Routes token base
export const requireSignIn = async (req, res, next) => {
  try {
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decode;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Please Login To Access This Page",
      error,
    });
  }
};

//admin access
export const isAdmin = async (req, res, next) => {
  try {
    const allowedAdminEmails = process.env.ALLOWED_ADMIN_EMAILS;

    if (!allowedAdminEmails) {
      return res.status(500).send({
        success: false,
        message: "Allowed admin email configuration missing.",
      });
    }

    const userEmail = req.user._id;

    if (allowedAdminEmails === userEmail) {
      next();
    }
    else {
      return res.status(403).send({
        success: false,
        message: "Unauthorized Access . Admin Only",
      });
    }

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Admin Middleware",
      error,
    });
  }
}

export default requireSignIn;