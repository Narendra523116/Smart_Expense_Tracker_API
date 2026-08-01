import {Router} from "express";
import { addExpense, deleteExpense, getExpenses, calcualteExpense, monthlySummary } from "../controllers/expenseController.js";
import {readLimit, writeLimit} from "../middlewares/rateLimiter.js";

const router = Router();

router.get("/", readLimit, getExpenses); //works for query paramter i.e ?category=lifestyle
router.get("/totals", readLimit, calcualteExpense); //works for query paramter i.e ?category=food
router.get("/summary/monthly", readLimit, monthlySummary); // works for query param i.e ?month=2026-07
router.post("/", writeLimit, addExpense); // for adding a new expense
router.delete("/delete/:id", writeLimit, deleteExpense); // only if param is specified

export default router;
