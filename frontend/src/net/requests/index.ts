import { authenticate } from './auth/auth';
import { createArticle } from './article/createArticle';
import { login } from './auth/login';
import { register } from './auth/register';
import { updateWordStatus } from './user/updateWordStatus';
import { updateWordStatusBatch } from './user/updateWordStatusBatch';
import { getWordData, useGetWordData } from './user/getWordData';

export {
    authenticate,
    createArticle,
    login,
    register,
    updateWordStatus,
    updateWordStatusBatch,
    getWordData,
    useGetWordData,
};
