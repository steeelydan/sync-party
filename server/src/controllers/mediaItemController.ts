import fs from 'fs';
import path from 'path';
import { insertNewMediaItem } from '../database/generalOperations';
import {
    mediaItemValidator,
    newMediaItemValidator
} from '../common/validation';
import { Request, Response } from 'express';
import { Logger } from 'winston';

/**
 * @api {get} /api/allMediaItems Get All MediaItems (Admin only)
 * @apiName getAllMediaItems
 * @apiGroup mediaItemController
 * @apiDescription Populates media items view
 * @apiPermission admin
 * @apiHeader {String} cookie Express session cookie 'connect.sid' (checked by passport.js middleware)
 * @apiSuccess {Object[]} allMediaItems All media items.
 * @apiError notAuthorized Requesting user is not admin.
 */
const getAllMediaItems = async (
    req: Request,
    res: Response,
    // FIXME: Type
    models: any,
    logger: Logger
) => {
    try {
        const allMediaItems = await models.MediaItem.findAll();
        return res.status(200).json({
            success: true,
            msg: 'fetchingSuccessful',
            allMediaItems
        });
    } catch (error) {
        logger.log('error', error);
        return res.status(500).json({
            success: false,
            msg: 'error'
        });
    }
};

/**
 * @api {post} /api/mediaItem Create MediaItem
 * @apiName createMediaItem
 * @apiGroup mediaItemController
 * @apiDescription Create a new MediaItem and add it to corresponding party. Only applies to non-file media items.
 * @apiPermission user
 * @apiHeader {String} cookie Express session cookie 'connect.sid' (checked by passport.js middleware)
 * @apiParam {String} mediaItem New MediaItem.
 * @apiParam {String} partyId Party ID.
 * @apiError notAuthorized Requesting user is not admin or party is not active.
 */
const createMediaItem = async (
    req: Request,
    res: Response,
    // FIXME type
    models: any,
    logger: Logger
) => {
    const newMediaItem = req.body.mediaItem;

    if (newMediaItemValidator.validate(newMediaItem).error) {
        logger.log(
            'info',
            `Validation error while creating mediaItem: ${JSON.stringify(
                newMediaItemValidator.validate(newMediaItem).error
            )}`
        );
        return res.status(400).json({ success: false, msg: 'validationError' });
    }

    const insertSuccessful = await insertNewMediaItem(
        req,
        newMediaItem,
        models,
        logger
    );

    if (insertSuccessful) {
        return res
            .status(200)
            .json({ success: true, msg: 'mediaItemAddSuccessful' });
    } else {
        return res.status(403).json({ success: false, msg: 'notAuthorized' });
    }
};

/**
 * @api {put} /api/mediaItem/:id Edit MediaItem
 * @apiName editMediaItem
 * @apiGroup mediaItemController
 * @apiDescription Edit a mediaItem (name only atm)
 * @apiPermission user
 * @apiHeader {String} cookie Express session cookie 'connect.sid' (checked by passport.js middleware)
 * @apiParam {String} id MediaItem ID.
 * @apiError notAuthorized Requesting user is not admin or party is not active.
 */
const editMediaItem = async (
    req: Request,
    res: Response,
    // FIXME type
    models: any,
    logger: Logger
) => {
    const id = req.params.id;
    const editedMediaItem = req.body;

    if (mediaItemValidator.validate(editedMediaItem).error) {
        logger.log(
            'info',
            `Validation error while creating mediaItem: ${JSON.stringify(
                mediaItemValidator.validate(editedMediaItem).error
            )}`
        );
        return res.status(400).json({ success: false, msg: 'validationError' });
    }

    const dbMediaItem = await models.MediaItem.findOne({
        where: {
            id
        }
    });

    const requestUser = req.user;

    if (dbMediaItem.owner === requestUser.id || requestUser.role === 'admin') {
        dbMediaItem.name = editedMediaItem.name;

        dbMediaItem.save();
        return res
            .status(200)
            .json({ success: true, msg: 'mediaItemEditSuccessful' });
    } else {
        return res.status(403).json({ success: false, msg: 'notAuthorized' });
    }
};

/**
 * @api {delete} /api/mediaItem/:id Delete MediaItem
 * @apiName deleteMediaItem
 * @apiGroup mediaItemController
 * @apiDescription Delete a mediaItem. Users can only delete their items, admin can delete every item
 * @apiPermission user
 * @apiHeader {String} cookie Express session cookie 'connect.sid' (checked by passport.js middleware)
 * @apiParam {String} id MediaItem ID.
 * @apiError notAuthorized Requesting user is not admin or party is not active.
 */
const deleteMediaItem = async (
    req: Request,
    res: Response,
    // FIXME type
    models: any,
    logger: Logger
) => {
    const requestUser = req.user;

    const mediaItemId = req.params.id;
    try {
        const item = await models.MediaItem.findOne({
            where: {
                id: mediaItemId
            }
        });
        if (item.owner === requestUser.id || requestUser.role === 'admin') {
            if (item.type === 'file') {
                fs.unlinkSync(
                    path.join(__dirname, '/../../uploads/', item.url)
                );
            }

            item.destroy();

            return res.status(200).json({
                success: true,
                msg: 'mediaItemDeleteSuccessful'
            });
        } else {
            return res
                .status(403)
                .json({ success: false, msg: 'notAuthorized' });
        }
    } catch (error) {
        logger.log('error', error);
        return res.status(500).json({ success: false, msg: 'error' });
    }
};

export default {
    getAllMediaItems,
    createMediaItem,
    editMediaItem,
    deleteMediaItem
};
