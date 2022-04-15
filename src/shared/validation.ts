import Joi from 'joi';

const newMediaItemValidator = Joi.object({
    name: Joi.string().max(256).required(),
    type: Joi.string().valid('web', 'file').required(),
    owner: Joi.string().uuid().required(),
    url: Joi.string().max(4096).required()
});

const mediaItemValidator = newMediaItemValidator.keys({
    id: Joi.string().uuid().required(),
    settings: Joi.object({}).required(),
    createdAt: Joi.date(),
    updatedAt: Joi.date()
});

const newFileMediaItemValidator = newMediaItemValidator.keys({
    id: Joi.string().uuid().required(),
    settings: Joi.object().required()
});

const multerFileValidator = Joi.object({
    fieldname: Joi.string().valid('file').required(),
    originalname: Joi.string().min(3).max(1024).required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().required(),
    destination: Joi.string().required(),
    filename: Joi.string().required(),
    path: Joi.string().required(),
    size: Joi.number().max(3000000000).required()
});

const newPartyValidator = Joi.object({
    owner: Joi.string().uuid().required(),
    name: Joi.string().max(256).required(),
    status: Joi.string().valid('active', 'stopped').required(),
    members: Joi.array().has(Joi.string().uuid()),
    items: Joi.array().required(),
    metadata: Joi.object().required(),
    settings: Joi.object()
        .keys({
            webRtcIds: Joi.object()
                .pattern(/^/, [Joi.string(), Joi.string()])
                .required(),
            webRtcToken: Joi.string() // TBI: Deprecated, can be removed when all parties are migrated
        })
        .required()
});

const partyValidator = newPartyValidator.keys({
    id: Joi.string().uuid().required(),
    createdAt: Joi.date(),
    updatedAt: Joi.date()
});

const partyMediaItemsValidator = Joi.array().items(Joi.string().uuid());

const partyMetadataValidator = Joi.object({
    played: Joi.object().unknown()
});

export {
    newMediaItemValidator,
    mediaItemValidator,
    partyMediaItemsValidator,
    newFileMediaItemValidator,
    multerFileValidator,
    newPartyValidator,
    partyValidator,
    partyMetadataValidator
};
