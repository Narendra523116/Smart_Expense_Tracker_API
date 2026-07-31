import express from "express";
import cors from "cors";
import expenseRoutes from "./routes/expenseRoutes.js";
import e from "express";


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended : true}));

//routing
app.use('/api/expenses', expenseRoutes);

// if route not found
app.use((req, res)=>{
    res.status(400).json({
        error: "You are here, but the route isn't"
    })
})

export default app;