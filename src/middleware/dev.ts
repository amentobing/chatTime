import { Request, Response, NextFunction } from "express";

export default async function devVerify(req: Request, res: Response, next: NextFunction) {
  const { token } = req.body;

  if (!token || token !== "amengantengSedunia775") return res.status(404);
  next();
}
