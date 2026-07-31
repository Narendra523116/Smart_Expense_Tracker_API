import {Router} from "express";
import { addExpense, deleteExpense, getExpenses, calcualteExpense } from "../controllers/expenseController.js";

const router = Router();

router.post("/", addExpense);
router.get("/", getExpenses); //works for query paramter i.e ?category=lifestyle
router.delete("/:id", deleteExpense); // only if param is specified
router.get("/total", calcualteExpense); //works for query paramter i.e ?category=food

export default router;
