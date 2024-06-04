import express from 'express'
import { addTeam, processResult ,teamResult} from '../controllers/userController.js'

const userRouter =express.Router()

userRouter.post('/add-team',addTeam)
userRouter.post('/process-result',processResult)
userRouter.get('/team-result',teamResult)

export default userRouter