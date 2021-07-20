const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10 // 암호화된 솔트의 자릿수
var jwt = require('jsonwebtoken')


const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: { // 0: 일반 직원, 1: 임원 같은 식으로 적용할 예정
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

userSchema.pre('save', function(next){
    var user = this
    if(user.isModified('password')){
        // 비밀번호를 암호화 시킴
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err)
            
            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) return next(err)

                user.password = hash // hash된 비밀번호로 교체
                next()
            })
        })
    }
    else{
        next()
    }
})

userSchema.methods.comparePassword = function(plainPassword, callback){
    // plainPassword 1234567
    // 암호화된 비밀번호 $2b$10$5POTzC3jnH8edYQtJHMNhuB7hvofTQbcKKoYaoNr4ZWXF0XgLBaca
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return callback(err)
        callback(null, isMatch) // true
    })
}

userSchema.methods.generateToken = function(callback){
    var user = this
    // jsonwebtoken을 이용해서 토큰을 생성하기
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    user.token = token
    user.save(function(err, user){
        if(err) return callback(err)
        callback(null, user) // 토큰 저장 성공
    })
}

userSchema.statics.findByToken = function(token, callback){
    var user = this

    // 토큰을 decode한다
    jwt.verify(token, 'secretToken', function(err, decoded){
        // 유저 아이디를 이용해서 유저를 찾은 다음에
        // 클라이너트에서 가져온 토큰과 DB에서 보관된 토큰이 일치하는지 확인

        user.findOne({ "_id": decoded, "token": token }, function(err, user){
            if(err) return callback(err)
            callback(null, user)
        })
    })
}

const User = mongoose.model('User', userSchema)

module.exports = { User }