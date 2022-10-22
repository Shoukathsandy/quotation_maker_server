import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { Quotation_Maker_Route } from "./Routes/Quotation_Maker.js";


dotenv.config();
const app = express();

app.use(express.json());

app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

app.get("/",function(req,res){
    res.send("this is home page for Quotation Maker project server..")
});

async function createConnection (){
    const client =new  MongoClient(MONGO_URL);
    await client.connect();
    console.log("mongodb is connected successfully");
    return client;
};
 export const client = await createConnection();

 app.use("/Quotation", Quotation_Maker_Route);
app.listen(PORT, ()=>console.log(`this is port no: ${PORT}`));


