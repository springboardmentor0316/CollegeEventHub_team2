import jwt from "jsonwebtoken";
//this middleware will be execyted whenevr we hit the api endpoint get token from cookie and decoded and get userid and uses next and execytes our controller function
const userAuth = async (req, res, next) => {

    const {token} = req.cookies;

    if(!token){
        return res.json({success:false, message:"Unauthorized. Login Again"});
    }

    try{

        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        if(tokenDecode.id){
            req.body.userId = tokenDecode.id;
        }else{
            return res.json({success:false, message:"Unauthorized. Login Again"});
        }

        next(); //call our controller function
        

    }catch(error){
        return res.json({success:false, message:error.message});
    }

}

export default userAuth;