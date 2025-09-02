import mongoose from "mongoose";

const connectDB = async () => {
    
    console.log("Attempting to connect with URI:", process.env.MONGO_URI);

    try {
        mongoose.connection.on('connected', () => console.log("Database Connected"));
        await mongoose.connect(process.env.MONGO_URI);
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;