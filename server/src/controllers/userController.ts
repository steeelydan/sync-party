/**
 * @api {get} /api/allUsers Get All Users (Admin only)
 * @apiName getAllUsers
 * @apiGroup userController
 * @apiDescription Get All Users (Admin only).
 * @apiPermission admin
 * @apiHeader {String} cookie Express session cookie 'connect.sid' (checked by passport.js middleware)
 * @apiSuccess {Object[]} allUsers Array of all users, formatted.
 * @apiError notAuthorized Requesting user is not admin.
 */
const getAllUsers = async (req, res, models) => {
    const users = await models.User.findAll();
    if (users) {
        const formattedUsers = users.map((user) => {
            return {
                username: user.username,
                id: user.id
            };
        });

        return res.status(200).json({
            success: true,
            msg: 'userFetchingSuccessful',
            allUsers: formattedUsers
        });
    } else {
        return res.status(200).json({
            success: true,
            msg: 'noUsers',
            allUsers: []
        });
    }
};

export default { getAllUsers };
