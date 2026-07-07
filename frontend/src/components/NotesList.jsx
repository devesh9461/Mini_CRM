import { memo } from 'react';
import { HiOutlineCalendar, HiOutlineClock, HiOutlineTrash } from 'react-icons/hi';

const NotesList = memo(function NotesList({ notes, onDelete }) {
  if (!notes || notes.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '32px 16px' }}>
        <div className="empty-state__icon">📝</div>
        <div className="empty-state__title">No notes yet</div>
        <div className="empty-state__desc">
          Add your first note or follow-up below.
        </div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="notes-timeline">
      {notes.map((note) => (
        <div key={note.id} className="note-item">
          <div className="note-timeline-dot" />
          <div className="note-content">
            <div className="note-text">{note.content}</div>
            <div className="note-meta">
              <span>
                <HiOutlineClock style={{ marginRight: 4, verticalAlign: 'middle' }} />
                {formatDate(note.created_at)} at {formatTime(note.created_at)}
              </span>
              {note.follow_up_date && (
                <span className="note-follow-up">
                  <HiOutlineCalendar />
                  Follow-up: {formatDate(note.follow_up_date)}
                </span>
              )}
              <button
                className="btn-ghost note-delete-btn"
                title="Delete note"
                onClick={() => {
                  if (window.confirm('Delete this note?')) {
                    onDelete(note.id);
                  }
                }}
              >
                <HiOutlineTrash size={14} color="var(--status-lost)" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default NotesList;
