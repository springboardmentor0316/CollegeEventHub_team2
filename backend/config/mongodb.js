import mongoose from "mongoose";

const connectDB = async () => {
    
    console.log("Attempting to connect with URI:", process.env.MONGODB_URI);

    try {
        mongoose.connection.on('connected', () => console.log("Database Connected"));
        await mongoose.connect(`${process.env.MONGODB_URL}/mern-auth`);
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;