const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const weatherSchema = new mongoose.Schema({
    cityName: {
        type: String,
        required: true
    },
    Temperature:{
        type : Number,
        
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
   
});


// Middleware bcrypt function
weatherSchema.pre('save', async function (next) {
    const weather = this;
    if (!weather.isModified('password')) {
         return next();  // If updating record i.e already saved data in db so already hashed
         }
    try {

        // Hashed = hashing password + salt (some additional hashed for more security)... 10 is here length
        const salt = await bcrypt.genSalt(10);

        // Hash password
        const hashpassw = await bcrypt.hash(weather.password, salt);

        // Overriding the plain password with hash password
        weather.password = hashpassw;

        next(); // signals to save data in db

    } catch (err) {
        return next(err);
    }
});

weatherSchema.methods.comparePassword = async function (userpassword) {
    try {
        // Bcrypt contains both hashed and initial password
        // The compare function automatically extracts the salt from storedHashedPassword and uses it 
        // to hash the entered password. It then compares the resulting hash with the stored hash. If they match, it indicates that password is correct.
        // i.e., salt from stored + entered hash then compare with stored hash
        const matchIS = await bcrypt.compare(userpassword, this.password);
        console.log(`Comparing passwords: userpassword=${userpassword}, storedPassword=${this.password}, match=${matchIS}`);
        return matchIS;
    } catch (err) {
        console.error('Error comparing passwords:', err);
        throw err;
    }
};


const Address = mongoose.model('Address', weatherSchema);

module.exports = Address;
 