import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type TokenPayLoad = {
  userId: string;
  email: string;
};

const authValidator = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.get("Authorization");

  if (authHeader === undefined) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  const token = authHeader.split(" ")[1];
  // console.log("token: ", token);
  try {
    const decodedToken = jwt.verify(token, "mySecretKey") as TokenPayLoad;
    if (decodedToken === null) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    res.locals.userId = decodedToken.userId;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Not authenticated" });
  }
};

export default authValidator;
