const { Router } = require("express");
const adminMiddleware = require("../middleware/admin");
const { Admin, Course } = require("../db");
const jwt=require("jsonwebtoken");
const jwtPassword="123456"
const router = Router();
const zod=require("zod");
const UsernameSchema=zod.string().email();
const passwordSchema=zod.string().min(6);

// Admin Routes
router.post('/signup', async(req, res) => {
    // Implement admin signup logic
    const username = req.body.username;
    const password = req.body.password;
    const usernameCheck=UsernameSchema.safeParse(username);
    const passwordCheck=passwordSchema.safeParse(password);
    if(!usernameCheck.success || !passwordCheck.success){
        res.status(403).json({
            msg: "Invalid Username or Password"
        })
    }
    else{
        const userCheck = await Admin.findOne({
            username: username,
            password: password
        })
        if (userCheck) {
            res.status(403).json({
                msg: "Admin Already Exists"
            })
        }
        else {
            try {
                await Admin.create({
                    username: username,
                    password: password
                });
                res.status(200).json({
                    msg: "Admin Created Successfully"
                });
            }
            catch (e) {
                res.status(500).json({
                    msg: "Error creating the admin"
                });
            }
        }
    }
});

router.post('/signin', async (req, res) => {
    // Implement admin signin logic
    const username = req.body.username;
    const password = req.body.password;
    const usernameCheck=UsernameSchema.safeParse(username);
    const passwordCheck=passwordSchema.safeParse(password);
    if(!usernameCheck.success || !passwordCheck.success){
        res.status(403).json({
            msg: "Invalid Username or Password"
        })
    }
    else{
        const response=await Admin.findOne({
            username: username,
            password: password
        });
        if(response){
            const token=jwt.sign({
                username: username,
            }, jwtPassword);
            res.status(200).json({
                token
            })
        }
        else{
            res.json({
                msg:"User does not exist in our database"
            })
        }
    }
});

router.post('/courses', adminMiddleware, async(req, res) => {
    // Implement course creation logic
    const title=req.body.title;
    const description=req.body.description;
    const price=req.body.price;
    const imageLink=req.body.imageLink;
    try {
        const newCourse=await Course.create({
            title,
            description,
            price,
            imageLink 
        })
        res.status(200).json({
            msg: "Course Created Successfully",
            courseId: newCourse._id
        })
    }
    catch (e) {
        res.status(500).json({
            msg: "Error creating the course"
        })
    }
});

router.get('/courses', adminMiddleware, async (req, res) => {
    // Implement fetching all courses logic
    const response=await Course.find({});
    res.status(200).send({
        response
    })
});

module.exports = router;