/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    thread_id: {
      type: 'VARCHAR(50)',
    },
    owner: {
      type: 'VARCHAR(30)',
      notNull: true
    },
    content: {
      type: 'TEXT',
      notNull: true
    },
    date: {
      type: 'TEXT',
    },
    is_delete: {
      type: 'BOOLEAN',
      default: false,
    },
    like_count: {
      type: 'INTEGER',
      default: 0,
    },
    liked_by: {
      type: 'TEXT[]',
      default: pgm.func('ARRAY[]::TEXT[]'), // default empty array
    },
  })
}

exports.down = (pgm) => {
  pgm.dropTable('comments')
}
