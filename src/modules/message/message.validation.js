import joi from "joi"
import { generalFields } from "../../middlewares/Validation.middleware.js"

export const sendMessageValidation  = {
    params: joi.object({
        receiverId: generalFields.id.required()
    }),
    body: joi.object({
        content: joi.string().min(2).max(500).required().messages({
            'string.min': 'message must be at least 2 characters',
            'string.max': 'message must be less than 500 characters',
            'string.required': 'message is required'
        })
    })
}
    