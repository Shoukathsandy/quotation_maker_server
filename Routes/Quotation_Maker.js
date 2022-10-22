import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import randomstring from 'randomstring';
import nodemailer from "nodemailer";
import {
    getlogindata,
    getusername,
    passtokenset,
    updateuserpassDetails,
    getUserpasstoken,
    createVendorlist,
    getvendorlist,
    updatevendorlist,
    getvendorbyid,
    createproductlist,
    getproductbyidno,
    getproductlist,
    updateproductlist,
    createcustormerlist,
    getcustomerlist,
    getcustomerbyid,
    updatecustomerbyid,
    getprojectbyid,
    createprojectlist,
    getallprojectlist,
    editprojectbyid,
    createquotation,
    getquotationbytid,
    getallquotation,
    updatequotation,
    createquotationdata,
    deletevendorbyemail,
    deleteproductbyitemno,
    deletecustomerbyemail,
    deleteprojectbyid,
    deletequotationbyid,
} from "./helper.js";

const router = express.Router();

async function genhashpassword(password) {
    //no.of.salting = 10
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);
    // console.log(hashedpassword);
    return hashedpassword;
};

router.post("/register", async function (req, res) {
    try {
        const { email, password } = req.body;
        const hashedpassword = await genhashpassword(password);
        const existuser = await getusername(email);

        if (existuser) {
            console.log(existuser)
            res.status(422).send({ error: "Already email exist" });
            console.log(existuser.error);
        } else {
            const result = getlogindata({ email: email, password: hashedpassword });
            res.status(200).send({ msg: "sucessfully registered" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "Internal server error" });
    };
});

router.post("/login", async function (req, res) {
    try {
        const { email, password } = req.body;
        const existuser = await getusername(email);
        if (!existuser) {
            res.status(401).send({ error: "User dose not exist" })
        } else {
            const storedpassword = existuser.password;
            const ispasswordmatch = await bcrypt.compare(password, storedpassword);
            if (ispasswordmatch) {

                const token = jwt.sign({ id: existuser._id }, process.env.SECRET_KEY);

                res.send({ msg: "sucessfull login", token: token, email: email, id: existuser._id });

            } else {
                res.status(401).send({ error: "Invalid password or email" });
            }
        }
    } catch (error) {
        res.status(500).send({ error: "Internal server error" });
    }
});

router.post("/forgotpassword", async function (req, res) {

    try {
        const { email } = req.body;
        let randomString = randomstring.generate();
        const isuserexist = await getusername(email);

        if (!isuserexist) {
            console.log("invalvendorId email");
            res.status(401).send({ error: "Invalid email" });
        } else {

            const linkForUser = `${process.env.FRONTEND_URL}/reset-password/${isuserexist._id}/${randomString}`

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.MAIL_USERNAME,

                    pass: process.env.MAIL_PASSWORD,
                }

            });
            //Mail options
            let mailOptions = {
                from: "no-reply@noreply.com",
                to: email,
                subject: "Reset Password - BrandFP",
                html: `<h4>Hello User,</h4><br><p> You can reset the password by clicking the link below.</p><br><u><a href=${linkForUser}>${linkForUser}</a></u>`,
            };
            //Send mail
            transporter.sendMail(mailOptions, async (err, data) => {
                if (err) {
                    console.log(err);
                    res.status(401).send({ error: "email not send" });
                } else {
                    const ispasstoken = await passtokenset(email, randomString);

                    res
                        .status(200)
                        .send({
                            msg: "email sent successfully",
                            pass_token: randomString,
                        });
                }
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "Internal server error" });
    }
});
// resetpassword method
router.post("/resetpassword", async function (req, res) {
    try {
        const pass_token = req.body.pass_token;
        const password = req.body.password;
        const confirmpassword = req.body.confirmpassword;
        const isuserpasstokenexist = await getUserpasstoken(pass_token);
        // console.log(pass_token);
        // console.log(password);
        // console.log(confirmpassword);
        if (!isuserpasstokenexist) {
            console.log("invalidvendorId msg")
            res.status(401).send({ error: "InvalidvendorId credentials" });
        } else {
            if (password === confirmpassword) {
                const hashpass = await genhashpassword(password);

                const ispasstoken = await updateuserpassDetails(pass_token, hashpass);
                console.log(ispasstoken)
                res.status(200).send({ msg: "password set successfully" });
            } else {
                res.status(200).send({ error: "confirmed password not match" });
            }
        }
    } catch (error) {
        res.status(500).send({ error: "Internal error" });
    }
});

//create vendor list
router.post("/createvendorlist", async function (req, res) {
    try {
        const data = req.body;
        const Email = req.body.Email;
        // console.log(Email) 
        const result = await getvendorbyid(Email);
        // console.log(result) 
        if (result) { res.status(401).send({ error: "verndor id already exist" }) }
        else {
            const createlist = await createVendorlist(data);
            // console.log(createlist) 
            res.status(200).send({ msg: "Successfully Added" })
        }
        // res.status(200).send(createlist);
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "Internal server error" })
    }
});

//get all vendor list
router.get("/getvendorlist", async function (req, res) {
    try {
        const result = await getvendorlist();
        res.status(200).send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "Internal server error" });
    }
});

//get vendorlist by id
router.get("/getvendorlist/:Email", async function (req, res) {
    try {
        const { Email } = req.params;
        const vendor = await getvendorbyid(Email);
        console.log(vendor)
        vendor ? res.send(vendor) : res.send("Email not match");

    } catch (error) {
        res.status(401).send({ error: "Internal server error" })
    }


})

//edit vendorlist
router.put("/:Email", async function (req, res) {
    try {
        console.log(req.params)
        const data = req.body;
        const { Email } = req.params;

        const result = await updatevendorlist(Email, data);
        res.status(200).send({ msg: "Successfully update" });

    } catch (error) {
        res.status(401).send({ error: "Internal server error" })
    }

})
//delete vendorlist
router.delete("/deletevendor/:Email", async function (req, res) {
    try {
        console.log(req.params)
        const data = req.body;
        const { Email } = req.params;

        const result = await deletevendorbyemail(Email);
        console.log(result)
        res.status(200).send({msg:"Successfully deleted"});

    } catch (error) {
        res.status(401).send({ error: "Internal server error" })
    }

})
//create peroductlist
router.post("/createproductslist", async function (req, res) {
    try {
        const data = req.body;
        const ItemNo = req.body.ItemNo;
        // console.log(Email) 
        const result = await getproductbyidno(ItemNo);
        // console.log(result) 
        if (result) { res.status(401).send({ error: "Item No already exist" }) }
        else {
            const createlist = await createproductlist(data);
            // console.log(createlist) 
            res.status(200).send({ msg: "Successfully Added" })
        }
        // res.status(200).send(createlist);
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "Internal server error" })
    }
});
//get productlist
router.get("/getproductlist", async function (req, res) {
    try {
        const data = await getproductlist();
        res.status(200).send(data);
    } catch (error) {
        res.status(401).send({ error: "Internal server error" })
    }
})
//get product by Itemno
router.get("/getproductlist/:ItemNo", async function (req, res) {
    try {
        const { ItemNo } = req.params;
        const product = await getproductbyidno(ItemNo);
        console.log(product)
        product ? res.send(product) : res.send("ItemNo not match");

    } catch (error) {
        res.status(401).send({ error: "Internal server error" })
    }


})
//edit productlist 
router.put("/:ItemNo", async function (req, res) {
    try {
        const data = req.body;
        const { ItemNo } = req.params;
        const result = await updateproductlist(ItemNo);
    } catch (error) {
        res.status(401).send({ error: "Internal server error" })
    }
});

//delete product
router.delete("/deleteproduct/:ItemNo", async function (req, res) {
    try {
        console.log(req.params)
        const data = req.body;
        const { ItemNo } = req.params;

        const result = await deleteproductbyitemno(ItemNo);
        console.log(result)
        res.status(200).send({msg:"Successfully deleted"});

    } catch (error) {
        res.status(401).send({ error: "Internal server error" })
    }

})
//create custormer list
router.post("/createcustomerlist",async function(req,res){
    try {
        const data = req.body;
        const {Email} = req.body;
        const result = await getcustomerbyid(Email);
        if(result){
            
            res.status(401).send({msg:"Already Email exist"})
        }else{
            const addcustomer = await createcustormerlist(data)
            res.status(200).send({msg:"Successfully added"})
        }
    } catch (error) {
        res.status(401).send({ error: "Internal server error" })
    }
});
//get all customerlist
router.get("/getallcustomerlist",async function(req,res){
    try {
      
        const result = await getcustomerlist();
        if(result){
        res.status(200).send(result);
        }else{
            res.status(401).send({error:"Data not available"})
        }
    } catch (error) {
        console.log(error)
        res.status(401).send({ error: "Internal server error" })
    }
})
//edit customer by email
router.put("/updatecustomerdetails/:Email",async function(req,res){
    try {
        const data = req.body;
        const {Email} = req.params;
        const result = await updatecustomerbyid(Email,data);
       res.status(200).send({msg:"successfull update"})
        console.log(result)
    } catch (error) {
        console.log(error)
        res.status(401).send({ error: "Internal server error" })
    }
})
//get customer by id
router.get("/getcustomerbyemail/:Email",async function(req,res){
    try {
        const { Email } = req.params;
        const result = await getcustomerbyid(Email)
        console.log(result)
        result ? res.send(result) : res.status(401).send({error:"Match not found"});
    } catch (error) {
        res.status(401).send({ error: "Internal server error" })
    }
})

//delete customer
router.delete("/deletecustomer/:Email", async function (req, res) {
    try {
        console.log(req.params)
        const data = req.body;
        const { Email } = req.params;

        const result = await deletecustomerbyemail(Email);
        console.log(result)
        res.status(200).send({msg:"Successfully deleted"});

    } catch (error) {
        res.status(401).send({ error: "Internal server error" })
    }

})

//create projectlist
router.post("/createprojectlist",async function(req,res){
    try {
        const data = req.body;
        const {ProjectId} = req.body;
        const result = await getprojectbyid(ProjectId)
        if(result){
            res.status(401).send({error:"Productlist not created"})
        }else{
            const create = await createprojectlist(data);
            res.status(200).send({msg:"Successfully created"});
        }
    } catch (error) {
        res.status(401).send({ error: "Internal server error" })
    }
})
//get project list
router.get("/getallprojectlist",async function(req,res){
    try {
        const result = await getallprojectlist();
        if(result){
            res.status(200).send(result);
        }else{
            res.status(401).send({error:"Data not available"})
        }
    } catch (error) {
        res.status(401).send({ error: "Internal server error" })
    }
})
//get project detail by Projectid
router.get("/getprojectbyid/:ProjectId",async function(req,res){
    try {
        const data = req.body;
        const {ProjectId} = req.params;
        const result = await getprojectbyid(ProjectId);
     result ?
            res.status(200).send(result)
            :
            res.status(401).send({error:"Match not found"});
        
    } catch (error) {
        res.status(401).send({ error: "Internal server error" })
    }
});
//update project details by id
router.put("/updateprojectdetailsbyid/:ProjectNo",async function(req,res){
    try {
        const data = req.body;
        const {ProjectId} = req.params;
        const result = await editprojectbyid(ProjectId,data);
        if(result){
            res.status(200).send({msg:"Successfully updated"})
        }else{
            res.status(401).send({error:"Match not found"})
        }
    } catch (error) {
        res.status(401).send({ error: "Internal server error" })
    }
});

//delete project
router.delete("/deleteproject/:ProjectId", async function (req, res) {
    try {
        console.log(req.params)
        const data = req.body;
        const { ProjectId } = req.params;

        const result = await deleteprojectbyid(ProjectId);
        console.log(result)
        res.status(200).send({msg:"Successfully deleted"});

    } catch (error) {
        res.status(401).send({ error: "Internal server error" })
    }

})
// create get quotation
router.post("/createquotation",async function(req,res){
    try {
        const data = req.body;
        const {QuotationId}= req.body;
        const result = await getquotationbytid(QuotationId)
        if(result){
            console.log(result)
            res.status(401).send({error:"Quotation not created"});
           
        }else{
            const create = await createquotation(data);
            res.status(200).send({msg:"Create Successfully"})
        }
    } catch (error) {
        res.status(401).send({ error: "Internal server error" })
    }
});


// create quotation data 
router.post("/quotationdata", async function(req,res){
    try {
        const data = req.body;
    const result = await createquotationdata(data);
        res.status(200).send(result);
    } catch (error) {
        res.status(401).send({ error: "Internal server error" })
    }
})
//get all quotation list
router.get("/getallquotationlist",async function(req,res){
    try {
        const result = await getallquotation();
        if(result){
            res.status(200).send(result)
        }else{
            res.status(401).send({error:"Quotation list not available"})
        }
    } catch (error) {
        res.status(401).send({ error: "Internal server error" })
    }
});
//get quotation by id
router.get("/getquotationbyid/:QuotationId",async function(req,res){
    try {
        const {QuotationId} = req.params;
        const result = await getquotationbytid(QuotationId);
        if(result){
            res.status(200).send(result);
        }else{
            res.status(401).send({error:"Match not found"})
        }
    } catch (error) {
        res.status(401).send({ error: "Internal server error" })
    }
});
//update quotation by id
router.put("/updatequotation/:QuotationId",async function(req,res){
    try {
        const data = req.body;
        const {QuotationId} = req.params;
        const result = await updatequotation(QuotationId,data);
        if(result){
            res.status(200).send({msg:"Successfully added"})
        }else{
            res.status(401).send({error:"Not updated"})
        }
    } catch (error) {
        res.status(401).send({ error: "Internal server error" })
    }
})

//delete quotation
router.delete("/deletequotation/:QuotationId", async function (req, res) {
    try {
        console.log(req.params)
        const data = req.body;
        const { QuotationId } = req.params;

        const result = await deletequotationbyid(QuotationId);
        console.log(result)
        res.status(200).send({msg:"Successfully deleted"});

    } catch (error) {
        res.status(401).send({ error: "Internal server error" })
    }

})

export const Quotation_Maker_Route = router;
