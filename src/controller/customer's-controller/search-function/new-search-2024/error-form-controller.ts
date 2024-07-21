import { Request, Response } from "express";
import ErrorForm from "../../../../models/error-form";

// Get all error forms
export const getAllErrors = async (req: Request, res: Response) => {
  try {
    const errors = await ErrorForm.getAllErrors();
    res.status(200).json(errors);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve error forms", error });
  }
};

// Get a single error form by ID
export const getOneError = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const error = await ErrorForm.getOneError(id);
    if (error) {
      res.status(200).json(error);
    } else {
      res.status(404).json({ message: "Error form not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve error form", error });
  }
};

// Create a new error form
export const createError = async (req: Request, res: Response) => {
  const { source, destination, busName, time, date, errorDescription } =
    req.body;
  try {
    const newError = new ErrorForm(
      source,
      destination,
      busName,
      time,
      date,
      errorDescription
    );
    await newError.createError();
    res.status(200).json({ message: "Error form created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to create error form", error });
  }
};

// Update an existing error form by ID
export const updateError = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { source, destination, busName, time, date, errorDescription } =
    req.body;
  try {
    const errorForm = new ErrorForm(
      source,
      destination,
      busName,
      time,
      date,
      errorDescription,
      id
    );
    await errorForm.updateError(id);
    res.status(200).json({ message: "Error form updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update error form", error });
  }
};

// Delete an error form by ID
export const deleteError = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await ErrorForm.deleteError(id);
    res.status(200).json({ message: "Error form deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete error form", error });
  }
};
