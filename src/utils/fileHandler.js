import fs from "fs/promises";
import path from "path";
import { json } from "stream/consumers";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, '../data/expense.json');

//reading from the expense file
export const readExpense = async() => {
    try{
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data || '[]');
    }catch (error){
        throw error;
    }
}

//writing to the expense file
export const writeExpense = async(data) =>{
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}