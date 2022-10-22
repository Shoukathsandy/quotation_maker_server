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
    console.log(data)
    return await client.db("quotation").collection("vendorlist").insertOne(data);
}
//get all vendor list
export async function getvendorlist(){
    return await client.db("quotation").collection("vendorlist").find({}).toArray();
};
//get vendorlist by id
export async function getvendorbyid(Email){
    return await client.db("quotation").collection("vendorlist").findOne({Email:Email})
};
//delete vendor
export async function deletevendorbyemail(Email){
    return await client.db("quotation").collection("vendorlist").deleteOne({Email:Email})
}
//edit vendorlist
export async function updatevendorlist(Email,data){
    return await client.db("quotation").collection("vendorlist").updateOne({Email:Email},{$set:data});
}
//create productlist 
export async function createproductlist(data){
    return await client.db("quotation").collection("productlist").insertOne(data)
}
//get productlist by item no
export async function getproductbyidno(ItemNo){
    return await client.db("quotation").collection("productlist").findOne({ItemNo:ItemNo})
}
//get all productlist
export async  function getproductlist(){
    return await client.db("quotation").collection("productlist").find({}).toArray();
}
//edit productlist
export async function updateproductlist(ItemNo,data){
    return await client.db("quotation").collection("productlist").updateOne({ItemNo},{$set:data});
}
//delete product
export async function deleteproductbyitemno(ItemNo){
    return await client.db("quotation").collection("productlist").deleteOne({ItemNo:ItemNo})
}
//crreate customerslist
export  async function createcustormerlist(data){
    return await client.db("quotation").collection("customerlist").insertOne(data);
}

//get all customerslist
export async function getcustomerlist(){
    return await client.db("quotation").collection("customerlist").find({}).toArray();
};
//get customerlist by email
export async function getcustomerbyid(Email){
    return await client.db("quotation").collection("customerlist").findOne({Email:Email});
}//edit customer details
export async function updatecustomerbyid(Email,data){
    return await client.db("quotation").collection("customerlist").updateOne({Email:Email},{$set:data})
}
//delete customer
export async function deletecustomerbyemail(Email){
    return await client.db("quotation").collection("customerlist").deleteOne({Email:Email})
}
// create project list
export async function createprojectlist(data){
    return await client.db("quotation").collection("projectlist").insertOne(data);
};
//get all projectlist
export async function getallprojectlist(){
    return await client.db("quotation").collection("projectlist").find({}).toArray();
};
// get project by p.no
export async function getprojectbyid(ProjectId){
    return await client.db("quotation").collection("projectlist").findOne({ProjectId:ProjectId});
};
// edit project byt p.no
export async function editprojectbyid(ProjectId,data){
    return await client.db("quotation").collection("projectlist").updateOne({ProjectId:ProjectId},{$set:data});
};
//delete project
export async function deleteprojectbyid(ProjectId){
    return await client.db("quotation").collection("projectlist").deleteOne({ProjectId:ProjectId})
}
//create quotation
export async function createquotation(data){
    return await client.db("quotation").collection("quotationlist").insertOne(data);
};
//create quotation data
export async function createquotationdata(data){
    return await client.db("quotation").collection("quotationdata").insertOne(data);
}
// get all quotation 
export async function getallquotation(){
    return await client.db("quotation").collection("quotationlist").find({}).toArray();
};
// get quotation by quotation id
export async function getquotationbytid(QuotationId){
    return await client.db("quotation").collection("quotationlist").findOne({QuotationId:QuotationId});
};
// update quotation 
export async function updatequotation(QuotationId,data){
    return await client.db("quotation").collection("quotationlist").updateOne({QuotationId},{$set:data})
}
//delete quotation
export async function deletequotationbyid(QuotationId){
    return await client.db("quotation").collection("quotationlist").deleteOne({QuotationId:QuotationId})
}