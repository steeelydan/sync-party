import { Request, Response } from 'express';
import { Logger } from 'winston';

/**
 * @api {get} /api/userItems Get User MediaItems
 * @apiName getUserItems
 * @apiGroup userItemController
 * @apiDescription Get all mediaItems owned by the user.
 * @apiPermission user
 * @apiHeader {String} cookie Express session cookie 'connect.sid' (checked by passport.js middleware)
 * @apiSuccess {Object[]} userItems MediaItems owned by requesting user.
 */
const getUserItems = async (
    req: Request,
    res: Response,
    models: Models,
    logger: Logger
) => {
    const userId = req.user?.id;

    try {
        const userItems = await models.MediaItem.findAll({
            where: {
                owner: userId
            }
        });

        return res.status(200).json({
            success: true,
            msg: 'fetchingSuccessful',
            userItems
        });
    } catch (error) {
        logger.log('error', error);

        return res.status(500).json({
            success: false,
            msg: 'error'
        });
    }
};

export default { getUserItems };
