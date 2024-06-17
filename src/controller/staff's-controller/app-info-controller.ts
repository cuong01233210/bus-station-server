import { Request, Response } from "express";
import AppInfo from "../../models/app-info";

export async function readAppInfo(req: Request, res: Response) {
  try {
    const appInfo = await AppInfo.getAppInfo();
    // console.log(allComments);
    res
      .status(200)
      .json({
        version: appInfo.version,
        updated: appInfo.updated,
        content: appInfo.content,
      });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ message: "An error occurred while fetching appInfo" });
  }
}

export async function createAppInfo(req: Request, res: Response) {
  try {
    const appInfo = new AppInfo(
      req.body.version,
      req.body.updated,
      req.body.content
    );
    await appInfo.createAppInfo();
    res.status(200).json({ message: "create appInfo successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "failed to create appInfo" });
  }
}

export async function updateAppInfo(req: Request, res: Response) {
  try {
    const appInfo = new AppInfo(
      req.body.version,
      req.body.updated,
      req.body.content
    );
    await appInfo.updateAppInfo();
    console.log(req.body);
    res.status(200).json({ message: "update appInfo successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "failed to update appInfo" });
  }
}
