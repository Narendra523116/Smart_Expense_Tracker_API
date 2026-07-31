import { readExpense, writeExpense } from "../utils/fileHandler.js";

export const createExpense = async({id, title, amount, category, date}) => {
    const expenses = await readExpense();
    const newExpense = {
        id: Number(id),
        title,
        amount: Number(amount),
        category: category.toLowerCase(),
        date: date || new Date().toISOString().split('T')[0]
    };
    expenses.push(newExpense);
    await writeExpense(expenses);
    return newExpense;
}

export const getAllExpenses = async(category) =>{
    const expenses = await readExpense();
    if(category){
        category = category.toLowerCase();
        return expenses.filter(exp => exp.category === category);
    }
    return expenses;
}

export const removeExpense = async (id) => {
    id = Number(id);
    const expenses = await readExpense();
    const index = expenses.findIndex(exp => exp.id === id);

    // console.log(index);

    if(index == -1) return false;
    expenses.splice(index, 1);

    await writeExpense(expenses);
    return true;
}