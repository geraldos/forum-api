class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyAvailableThread(useCasePayload.thread);
    await this._commentRepository.verifyAvailableComment(useCasePayload.comment, useCasePayload.thread);
    await this._commentRepository.verifyOwnerComment(useCasePayload.comment, useCasePayload.owner);
    await this._commentRepository.deleteComment(useCasePayload.comment);

    return {
      status: 'success',
    };
  }
}

module.exports = DeleteCommentUseCase;
