import crypto from 'crypto';

// using map for O(1) lookup and deletion
const expensesMap = new Map();

// here for speed we are sacrificing memory by writing expense 2 times
const categoryIndex = new Map();

// incrementing totals by the time of addition and deletion so lookups of getting overall expense becomes O(1)
let overallTotal = 0;
const categoryTotals = {};


export const createExpense = async ({ title, amount, category, date }) => {
    category = category.toLowerCase();
    amount = Number(amount);
    const id = crypto.randomUUID();
    const newExpense = {
        id,
        title,
        amount,
        category,
        date: date || new Date().toISOString().split('T')[0]
    };

    //storing in main map i.e all expense
    expensesMap.set(id, newExpense);

    // storing based on category
    if (!categoryIndex.has(category)) {
        categoryIndex.set(category, new Map());
    }
    categoryIndex.get(normalizedCategory).set(id, newExpense);

    // updating totals
    overallTotal += numericAmount;
    categoryTotals[category] = (categoryTotals[category] || 0) + amount;

    return newExpense;
};

export const getAllExpenses = async (category) => {
    if (!category) {
        return Array.from(expensesMap.values());
    }

    category = category.toLowerCase();
    const categoryMap = categoryIndex.get(category);

    if (!categoryMap) {
        return [];
    }

    return Array.from(categoryMap.values());
};

export const removeExpense = async (id) => {

    /* 

    here deletion involves 3 stages
    1. deletion from mail expenses using id
    2. deletion from the categorymap using category, which we have to store before step1
       if that expense exist
    3. updating total expenses and the category expenses

    */


    const cleanId = String(id).trim();

    // O(1) because of hashmap
    const expense = expensesMap.get(cleanId);
    if (!expense) {
        return false;
    }

    
    expensesMap.delete(cleanId);

    // removing from the categorymap
    const categoryMap = categoryIndex.get(expense.category);
    if (categoryMap) {
        categoryMap.delete(cleanId);
        if (categoryMap.size === 0) {
        categoryIndex.delete(expense.category);
        }
    }

    // updating totals
    overallTotal -= expense.amount;
    if (categoryTotals[expense.category]) {
        categoryTotals[expense.category] -= expense.amount;
        if (categoryTotals[expense.category] <= 0) {
        delete categoryTotals[expense.category];
        }
    }

    return true;
};

export const totalExpense = async (category) => {
    // O(1) lookup
    if (category) {
        category = category.toLowerCase();
        const total = categoryTotals[category] || 0;
        
        return {
        category,
        total
        };
    }

    return {
        overallTotal,
        totalCount: expensesMap.size,
        byCategory: { ...categoryTotals }
    };
};