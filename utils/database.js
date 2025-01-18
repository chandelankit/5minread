import mongoose from 'mongoose';

let isConnected = false;

export const connectToDB = async()=>{

    mongoose.set('strictQuery',true);
    if(isConnected){
        console.log("Connected to MongoDB");
        return;
    } 

    try{

        await mongoose.connect(process.env.MONGO_DB_URI,{

            dbName: "promptSearch",
            useNewUrlParser: true,
            useUnifiedTopology: true,

        })

        isConnected = true;
        
        console.log('MongoDB connected')

    }catch(error){
        console.log("mongodb not connected")
        console.log(error);

    }
}