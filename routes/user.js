const { Router } = require("express");
const router = Router();
const userMiddleware = require("../middleware/user");
const { User, Course } = require("../db");
const jwt=require("jsonwebtoken");
const jwtPassword="123456";
const zod=require("zod");
const UsernameSchema=zod.string().email();
const passwordSchema=zod.string().min(6);

// User Routes
router.post('/signup', async(req, res) => {
    // Implement user signup logic
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
        const userCheck = await User.findOne({
            username: username,
            password: password
        })
        if (userCheck) {
            res.status(403).json({
                msg: "User Already Exists"
            })
        }
        else {
            try {
                await User.create({
                    username: username,
                    password: password
                });
                res.status(200).json({
                    msg: "User Registered Successfully"
                });
            }
            catch (e) {
                res.status(500).json({
                    msg: "Error registering the user"
                });
            }
        }
    }
});

router.post('/signin', async(req, res) => {
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
        const response=await User.findOne({
            username: username,
            password: password
        });
        if(response){
            const token=jwt.sign({username:username},jwtPassword)
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

router.get('/courses', async(req, res) => {
    // Implement listing all courses logic
    const response=await Course.find({});
    res.status(200).send({
        response
    })
});

router.post('/courses/:courseId', userMiddleware, async(req, res) => {
    // Implement course purchase logic
    const courseId = req.params.courseId;
    const username=req.username;
    await User.updateOne({
        username: username
    }, {
        "$push": {
            purchasedCourses: courseId
        }
    });
    res.json({
        msg:"Course purchased successfully"
    })
});

router.get('/purchasedCourses', userMiddleware, async(req, res) => {
    // Implement fetching purchased courses logic
    const user=await User.findOne({
        username: req.headers.username
    });
    const courses=user.purchasedCourses;
    const UserPurchasedCourses=await Course.findOne({
        _id: {
            "$in": courses
        }
    });
    res.json({
        UserPurchasedCourses
    })
});

module.exports = router