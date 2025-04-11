const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');
const LikeCommentUseCase = require('../../../../Applications/use_case/LikeCommentUseCase');
const DomainErrorTranslator = require("../../../../Commons/exceptions/DomainErrorTranslator");
const ClientError = require("../../../../Commons/exceptions/ClientError");

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    try {
      const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
      const { id: credentialId } = request.auth.credentials;
      const { threadId } = request.params;
      const addedComment = await addCommentUseCase.execute(
        {
          ...request.payload,
          thread: threadId,
          owner: credentialId,
        }
      );

      const response = h.response({
        status: 'success',
        data: {
          addedComment,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      const translatedError = DomainErrorTranslator.translate(error);

      if (translatedError instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: translatedError.message,
        });
        response.code(translatedError.statusCode);
        return response;
      }
    }
  }

  async deleteCommentHandler(request, h) {
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    const { id: credentialId } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    await deleteCommentUseCase.execute({
      comment: commentId,
      thread: threadId,
      owner: credentialId,
    });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }

  async likeCommentHandler(request, h) {
    const likeCommentUseCase = this._container.getInstance(LikeCommentUseCase.name);
    const { id: credentialId } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    await likeCommentUseCase.execute({
      comment: commentId,
      thread: threadId,
      owner: credentialId,
    });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = CommentsHandler;
