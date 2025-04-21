var jwt = require('jsonwebtoken')

const authAdmin=(req,res,next)=>{
    try{

        // collect token from cookies
        const token=req.cookies.token
        if(!token){
            return res.status(401).json({message:"not autherized"})
        }
        // decode token
        const decodedToken = jwt.verify(token,process.env.JWT_KEY)
        if(!decodedToken){
            return res.status(401).json({message:"  not autherized"})
           
        }
        // checking the role
        if(decodedToken.role!=="admin"){
           return res.status(401).json({message:"admin  not autherized"})
        }
        
        req.admin= decodedToken
        next()

    }
    catch(error){
        console.log(error)
        res.status(error.statusCode || 500).json({message:error.message||"internal server error"})

    }
}

module.exports={authAdmin}