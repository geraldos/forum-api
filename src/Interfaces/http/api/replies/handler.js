const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');
const DomainErrorTranslator = require("../../../../Commons/exceptions/DomainErrorTranslator");
const ClientError = require("../../../../Commons/exceptions/ClientError");

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    try {
      const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
      const { id: credentialId } = request.auth.credentials;

      const { threadId, commentId } = request.params;
      const addedReply = await addReplyUseCase.execute(
        {
          ...request.payload,
          thread: threadId,
          comment: commentId,
          owner: credentialId,
        }
      );

      const response = h.response({
        status: 'success',
        data: {
          addedReply,
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

      const response = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      response.code(500);
      return response;
    }
  }

  async deleteReplyHandler(request, h) {
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
    const { id: credentialId } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;

    await deleteReplyUseCase.execute(
      {
        id: replyId,
        thread: threadId,
        comment: commentId,
        owner: credentialId,
      }
    );

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = RepliesHandler;
