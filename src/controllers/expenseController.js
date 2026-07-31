import { createExpense, getAllExpenses, removeExpense } from "../services/expenseServices.js";

export const addExpense = async (req, res) => {
    try{
        // console.log(req);
        const {id, title, amount, category, date} = req.body;
        if(!id || !title || !amount || !category){
            return res.status(400).json({
                error: 'id, title, amount and category are necessary'
            })
        }

        if(isNaN(amount) || Number(amount) <= 0){
            return res.status(400).json({
                error: 'id, title, amount and category are necessary'
            })
        }

        const newExpense = await createExpense({id, title, amount, category, date});
        res.status(200).json({
            message: 'Expense succesfully added',
            data: newExpense
        })

    }catch(error){
        console.log(error)
        res.status(500).json({
            message: 'Error occured while adding expense'
        })
    }
}

export const getExpenses = async (req, res) => {
    try{
        const {category} = req.query;
        const expenses = await getAllExpenses(category);
        return res.status(200).json({
            message: "here is the expenses as you requested",
            data: expenses
        })
    }catch(error){
        return res.send(500).json({
            error: "Error while fetching expenses"
        })
    }
}

export const deleteExpense = async(req, res) => {
    try{
        const {id} = req.params;
        const isdeleted = await removeExpense(id);
        if(isdeleted){
            res.status(200).json({
                message: "Deletion succesful"
            })
        }else{
            res.status(200).json({
                message: `No expense with id ${id} to delete`
            })
        }
    }
    catch(error){
        res.status(500).json({
            error: "Deletion failed"
        })
    }
}