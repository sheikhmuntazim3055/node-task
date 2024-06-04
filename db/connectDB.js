import mongoose from 'mongoose'

const mongoAtlasUri ="mongodb+srv://sheikhmuntazim55:KjjqTLf9BojG1tZW@cluster0.sweiknn.mongodb.net/task_?retryWrites=true&w=majority&appName=Cluster0"
try {
    // await mongoose.connect("mongodb://127.0.0.1/task-")
    await mongoose.connect(mongoAtlasUri)
    console.log("database connected successfully");

} catch (error) {
    console.log("object");
 console.log(error);   
}