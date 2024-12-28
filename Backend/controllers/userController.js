const Users = require('../models/users');
const bcrypt = require('bcrypt')

exports.getUsersExceptCurrent = async (req, res) => {
  try {
    const userId = req.params.userId;
    const users = await Users.find({ _id: { $ne: userId } });
    const usersData = Promise.all(users.map(async (user) => {
        return { user: { email: user.email, fullName: user.fullName, receiverId: user._id } }
    }))
    res.status(200).json(await usersData);
  } catch (error) {
      console.log('Error', error)
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { email, name, oldPassword, newPassword, profile_picture } = req.body;
    console.log(email)
    const newProfile_picture = req.file;
    let avatarUrl = profile_picture
    if (req.file)
        avatarUrl = `/uploads/${newProfile_picture.filename}`
    console.log(avatarUrl)
    if (oldPassword){
        const tempUser = await Users.findOne({ email: email });
        const validatePassword = await bcrypt.compare(oldPassword, tempUser.password);
        if (!validatePassword){
            res.status(400).send('User email or password is incorrect');
            return;
        }
        else {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await Users.updateOne({ email: email }, { $set: { fullName: name, password: hashedPassword, profile_picture: avatarUrl } })
            .catch((err) => {
                res.status(500).json({
                    success: false,
                    message: 'Server error. Please try again.'
                });
            });
        }
    }
    else{
        await Users.updateOne({ email: email }, { $set: { fullName: name, profile_picture: avatarUrl } })
        .catch((err) => {
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again.'
            });
        });
    }
    const user = await Users.findOne({ email: email });
    return res.status(200).json({ user: { id: user._id, email: user.email, fullName: user.fullName, profile_picture: user.profile_picture }})
} catch (error) {
    console.log('Error', error)
}
};
