import mongoose from 'mongoose'


const playerSchema =new mongoose.Schema({
    player:{type:String,required:true},
    role:{type:String,required:true},
    team:{type:String,required:true}
})

const playerModel=mongoose.model('Player',playerSchema)

export default playerModel