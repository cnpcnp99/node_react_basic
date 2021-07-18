const express = require('express')
const app = express()
const port = 5000
//const bodyParser = require('body-parser') // bodyParser is deprecated in 2021
const { User } = require('./models/User')
const config = require('./config/key')

//application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true}))

// application/json
app.use(express.json())

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI,{
        useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))

app.get('/', (req, res) => {
  res.send('Hello World!!!!!')
})

app.post('/register', (req, res) => {
    // 회원가입 시 필요한 정보들은 client에서 가져오면
    // 그것들을  데이터 베이스에 넣어준다.
    const user = new User(req.body)

    user.save((err, userInfo) => { //MongoDB로 저장됨
        if(err) return res.json({ success: false, err }) // 실패시
        return res.status(200).json({
            success: true // 성공시 리턴으로 success: true 형식의 리턴을 줌
        })
    }) 

})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})