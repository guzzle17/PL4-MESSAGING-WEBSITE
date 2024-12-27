const Users = require('../models/users');

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
    const formData = req.body;
    if (formData.oldPassword !== ""){
        const tempUser = await Users.findOne({ email: formData.email });
        const validatePassword = await bcryptjs.compare(formData.oldPassword, tempUser.password);
        if (!validatePassword){
            res.status(400).send('User email or password is incorrect');
            return;
        }
        else {
            const hashedPassword = await bcryptjs.hash(formData.newPassword, 10);
            await Users.updateOne({ email: formData.email }, { $set: { fullName: formData.name, password: hashedPassword } })
            .catch((err) => {
                res.status(500).json({
                    success: false,
                    message: 'Server error. Please try again.'
                });
            });
        }
    }
    else{
        await Users.updateOne({ email: formData.email }, { $set: { fullName: formData.name } })
        .catch((err) => {
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again.'
            });
        });
    }
    const user = await Users.findOne({ email: formData.email });
    return res.status(200).json({ user: { id: user._id, email: user.email, fullName: user.fullName }})
} catch (error) {
    console.log('Error', error)
}
};
