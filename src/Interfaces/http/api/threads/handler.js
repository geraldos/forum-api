const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetDetailThreadUseCase = require('../../../../Applications/use_case/GetDetailThreadUseCase');
const DomainErrorTranslator = require("../../../../Commons/exceptions/DomainErrorTranslator");
const ClientError = require("../../../../Commons/exceptions/ClientError");

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    try {
      const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
      const { id: credentialId } = request.auth.credentials;
      const addedThread = await addThreadUseCase.execute(
        {
          ...request.payload,
          owner: credentialId,
        }
      );

      const response = h.response({
        status: 'success',
        data: {
          addedThread,
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

  async getThreadByIdHandler(request, h) {
    const { threadId } = request.params;
    const getDetailThreadUseCase = this._container.getInstance(GetDetailThreadUseCase.name);

    const thread = await getDetailThreadUseCase.execute({ id: threadId });

    const response = h.response({
      status: 'success',
      data: {
        thread,
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
