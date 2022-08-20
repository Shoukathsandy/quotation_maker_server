import express from "express";
import { ObjectId } from "mongodb";
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
    getvendorlist
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

            res.status(422).send({ error: "already email exist" });
            console.log(existuser.error);
        } else {
            const result = getlogindata({ email: email, password: hashedpassword });
            res.status(200).send({ msg: "sucessfully registered" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "internal server error" });
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
                res.send({ msg: "sucessfull login", token: token });
            } else {
                res.status(401).send({ error: "invalid password or email" });
            }
        }
    } catch (error) {
        res.status(500).send({ error: "internal server error" });
    }
});

router.post("/forgotpassword", async function (req, res) {
  
    try {
        const {email} = req.body;
        let randomString = randomstring.generate();
        const isuserexist = await getusername(email);

        if (!isuserexist) {
            console.log("invalid email");
            res.status(401).send({ error: "invalid email" });
        } else {
         
            const linkForUser=`${process.env.FRONTEND_URL}/reset-password/${isuserexist._id}/${randomString}`
          
            const transporter = nodemailer.createTransport({
                service:'gmail',
                auth: {
                    user: process.env.MAIL_USERNAME,
                  
                    pass: process.env.MAIL_PASSWORD,
                }
                
            });
            //Mail options
            let mailOptions = {
                from: "no-reply@noreply.com",
                to:email ,
                subject: "Reset Password - BrandFP",
                html:  `<h4>Hello User,</h4><br><p> You can reset the password by clicking the link below.</p><br><u><a href=${linkForUser}>${linkForUser}</a></u>`,
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
        res.status(500).send({ error:"internal server error" });
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
            console.log("invalid msg")
            res.status(401).send({ error: "invalid credentials" });
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
        res.status(500).send({ error: "internal error" });
    }
});

//create vendor list
router.post("/createvendorlist",async function(req,res){
    try {
        const data = req.body;
        const createlist = await createVendorlist(data);
        console.log(createlist)
        res.status(200).send(createlist);
    } catch (error) {
        console.log(error)
        res.status(500).send({error:"internal server error"})
    }
});

//get all vendor list
router.get("/getvendorlist",async function(req,res){
    try {
        const result = await getvendorlist();
        res.status(200).send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send({error:"internal server error"});
    }
})


export const Quotation_Maker_Route = router;
