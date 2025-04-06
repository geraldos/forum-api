const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyAvailableThread(useCasePayload.thread);
    await this._commentRepository.verifyAvailableComment(useCasePayload.comment, useCasePayload.thread);
    const addReply = new AddReply(useCasePayload);

    return this._replyRepository.addReply(addReply, useCasePayload.owner, useCasePayload.thread, useCasePayload.comment);
  }
}

module.exports = AddReplyUseCase;
