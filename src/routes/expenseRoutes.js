import {Router} from "express";
import { addExpense, deleteExpense, getExpenses, calcualteExpense } from "../controllers/expenseController.js";
import {readLimit, writeLimit} from "../middlewares/rateLimiter.js";

const router = Router();

router.get("/", readLimit, getExpenses); //works for query paramter i.e ?category=lifestyle
router.get("/total", readLimit, calcualteExpense); //works for query paramter i.e ?category=food
router.post("/", writeLimit, addExpense);
router.delete("/:id", writeLimit, deleteExpense); // only if param is specified

export default router;
