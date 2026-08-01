import crypto from 'crypto';

// using map for O(1) lookup and deletion
const expensesMap = new Map();

// here for speed we are sacrificing memory by writing expense 2 times
const categoryIndex = new Map();

// incrementing totals by the time of addition and deletion so lookups of getting overall expense becomes O(1)
let overallTotal = 0;
const categoryTotals = {};
const monthTotals = {}

const getMonth = (date) => date.slice(0,7);


export const createExpense = async ({ title, amount, category, date }) => {
    category = category.toLowerCase();
    amount = Number(amount);
    const id = crypto.randomUUID();
    date = date || new Date().toISOString().split('T')[0]
    const newExpense = {
        id,
        title,
        amount,
        category,
        date
    };

    //storing in main map i.e all expense
    expensesMap.set(id, newExpense);

    // storing based on category
    if (!categoryIndex.has(category)) {
        categoryIndex.set(category, new Map());
    }
    categoryIndex.get(category).set(id, newExpense);

    const monthStr = getMonth(date);


    // updating totals
    overallTotal += amount;
    categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    if(!monthTotals[monthStr]){
        monthTotals[monthStr]  = {
            total: 0,
            count: 0, 
            byCategory: {}
        }
    }

    monthTotals[monthStr].total += amount;
    monthTotals[monthStr].count += 1;
    monthTotals[monthStr].byCategory[category] =
        (monthTotals[monthStr].byCategory[category] || 0) + amount;

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

    //removing from monthlyIndex
    const dateStr = expense.date.slice(0,7);
    const category = expense.category;


    // updating totals
    overallTotal -= expense.amount;

    // updating category totals
    if (categoryTotals[expense.category]) {
        categoryTotals[expense.category] -= expense.amount;
        if (categoryTotals[expense.category] <= 0) {
        delete categoryTotals[expense.category];
        }
    }

    //updating monthly totals
    if(monthTotals[dateStr]){
        monthTotals[dateStr].total -= expense.amount;
        monthTotals[dateStr].count -= 1;
        if (monthTotals[dateStr].byCategory[expense.category]) {
            monthTotals[dateStr].byCategory[expense.category] -= expense.amount;
            if (monthTotals[dateStr].byCategory[expense.category] <= 0) {
                delete monthTotals[dateStr].byCategory[expense.category];
            }
        }
        if(monthTotals[dateStr].count <= 0) delete monthTotals[dateStr];
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

export const getMonthlySummary = async (month) => {
    // O(1) lookup for a single month "2026-07"
    if (month) {
        const summary = monthTotals[month] || { total: 0, count: 0, byCategory: {} };
        return {
            month,
            ...summary
        };
    }
 
    // no month specified -> return every month we have data for, oldest first
    const months = Object.keys(monthTotals).sort();
    return months.map((m) => ({
        month: m,
        ...monthTotals[m]
    }));
};