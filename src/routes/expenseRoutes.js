import {Router} from "express";
import { addExpense, deleteExpense, getExpenses } from "../controllers/expenseController.js";

const router = Router();

router.post("/", addExpense);
router.get("/", getExpenses);
router.delete("/:id", deleteExpense);

export default router;
