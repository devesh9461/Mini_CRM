import { useState, useEffect, memo } from 'react';
import { HiOutlinePlus } from 'react-icons/hi';

const STORAGE_KEY_PREFIX = 'note_draft_';

const AddNoteForm = memo(function AddNoteForm({ leadId, onSubmit }) {
  const [content, setContent] = useState(() => {
    if (!leadId) return '';
    try {
      return sessionStorage.getItem(STORAGE_KEY_PREFIX + leadId) || '';
    } catch {
      return '';
    }
  });
  const [followUpDate, setFollowUpDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!leadId) return;
    const key = STORAGE_KEY_PREFIX + leadId;
    if (content) {
      sessionStorage.setItem(key, content);
    } else {
      sessionStorage.removeItem(key);
    }
  }, [content, leadId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        content: content.trim(),
        follow_up_date: followUpDate || null,
      });
      setContent('');
      setFollowUpDate('');
      if (leadId) {
        sessionStorage.removeItem(STORAGE_KEY_PREFIX + leadId);
      }
    } catch {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="add-note-form" onSubmit={handleSubmit}>
      <div className="form-group" style={{ marginBottom: 12 }}>
        <label className="form-label">Add Note / Follow-up</label>
        <textarea
          className="form-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a note about this lead..."
          rows={3}
        />
      </div>
      <div className="add-note-form__row">
        <div className="form-group">
          <label className="form-label" htmlFor="follow-up-date">Follow-up Date (optional)</label>
          <input
            id="follow-up-date"
            className="form-input"
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!content.trim() || submitting}
          style={{ height: 42 }}
        >
          {submitting ? (
            <div className="spinner spinner--sm" />
          ) : (
            <>
              <HiOutlinePlus /> Add Note
            </>
          )}
        </button>
      </div>
    </form>
  );
});

export default AddNoteForm;
