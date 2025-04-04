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

    }
  })
}

exports.down = (pgm) => {
  pgm.dropTable('comments')
}
