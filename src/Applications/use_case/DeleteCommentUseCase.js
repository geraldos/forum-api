class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyAvailableThread(useCasePayload.thread);
    await this._commentRepository.verifyAvailableComment(useCasePayload.id);
    await this._commentRepository.verifyOwnerComment(useCasePayload.id, useCasePayload.owner);
    await this._commentRepository.deleteComment(useCasePayload.id);

    return {
      status: 'success',
    };
  }
}

module.exports = DeleteCommentUseCase;
