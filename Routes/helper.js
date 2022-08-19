import { client } from "../index.js";

export async function getlogindata(data){
    return await client.db("quotation").collection("details").insertOne(data);
};

export async function getusername(email){
    return await client.db("quotation").collection("details").findOne({email:email});
};

//get user fortget pass word token
export async function getUserpasstoken(pass_token){
    const details=await client.db("quotation").collection("details").findOne({pass_token:pass_token})
    return details
};

export async function passtokenset(email,randomString) {
    return await client.db("quotation").collection("details").updateOne({email:email},{$set:{pass_token:randomString}});
    
 }
 //reset password function
 export async function updateuserpassDetails(pass_token,password){
   
    const details=await client.db("quotation").collection("details").updateOne({pass_token:pass_token},{$set:{password:password}});
    return details;
}

//create vendorlist
export async function createVendorlist(data){
    return await client.db("quotation").collection("vendorlist").insertMany(data);
}
//get all vendor list
export async function getvendorlist(){
    return await client.db("quotation").collection("vendorlist").find({}).toArray();
};
