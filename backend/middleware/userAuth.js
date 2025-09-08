import jwt from "jsonwebtoken";
// const userAuth = async (req, res, next) => {

//     const {token} = req.cookies;

//     if(!token){
//         return res.json({success:false, message:"Unauthorized. Login Again"});
//     }

//     try{

//         const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

//         if(tokenDecode.id){
//             req.body.userId = tokenDecode.id;
//         }else{
//             return res.json({success:false, message:"Unauthorized. Login Again"});
//         }

//         next(); //call our controller function
        

//     }catch(error){
//         return res.json({success:false, message:error.message});
//     }

// }

// export default userAuth;


const userAuth = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.json({ success: false, message: "Unauthorized. Login Again" });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: tokenDecode.id }; // Set user in req.user
        next();
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
export default userAuth;